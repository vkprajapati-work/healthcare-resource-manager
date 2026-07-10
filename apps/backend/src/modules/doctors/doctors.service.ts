import { AuthorizationError, ConflictError, NotFoundError } from '../../shared/errors.js';
import { UserRole } from '../auth/auth.types.js';
import { DocumentFileCategory, ImageFileCategory } from '../files/files.types.js';
import { FilesService } from '../files/files.service.js';
import type { FileDto, IFileDocument } from '../files/files.types.js';
import { DoctorsRepository } from './doctors.repository.js';
import type {
  CreateDoctorInput,
  DoctorAccessContext,
  DoctorDto,
  DoctorFormInput,
  DoctorListMeta,
  DoctorListQuery,
  DoctorUploadedFiles,
  DoctorUpdateFormInput,
  IDoctorDocument,
  UpdateDoctorInput,
} from './doctors.types.js';

export class DoctorsService {
  constructor(
    private readonly doctorsRepository = new DoctorsRepository(),
    private readonly filesService = new FilesService(),
  ) {}

  public async list(
    query: DoctorListQuery,
    context: DoctorAccessContext,
  ): Promise<{ doctors: DoctorDto[]; meta: DoctorListMeta }> {
    this.assertAdmin(context);

    const [doctors, total] = await Promise.all([
      this.doctorsRepository.findMany(query),
      this.doctorsRepository.countMany(query),
    ]);

    return {
      doctors: doctors.map((doctor) => this.toDto(doctor)),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  public async getById(id: string, context: DoctorAccessContext): Promise<DoctorDto> {
    const doctor = await this.findExistingDoctor(id);
    this.assertCanAccessDoctor(doctor, context);
    return this.toDto(doctor);
  }

  public async getOwnProfile(context: DoctorAccessContext): Promise<DoctorDto> {
    this.assertDoctor(context);

    const doctor = await this.doctorsRepository.findByUserId(context.userId);

    if (!doctor) {
      throw new NotFoundError('Doctor profile not found');
    }

    return this.toDto(doctor);
  }

  public async create(input: CreateDoctorInput, context: DoctorAccessContext): Promise<DoctorDto> {
    this.assertAdmin(context);
    await this.assertUniqueFields(input);

    const doctor = await this.doctorsRepository.create(input);
    return this.toDto(doctor);
  }

  public async createFromForm(
    input: DoctorFormInput,
    files: DoctorUploadedFiles | undefined,
    context: DoctorAccessContext,
  ): Promise<DoctorDto> {
    const { documentCategories, ...doctorInput } = input;
    this.assertAdmin(context);
    await this.assertUniqueFields(doctorInput);

    const mediaFields = await this.uploadFormFiles(files, documentCategories, context.userId);
    const doctor = await this.doctorsRepository.create({
      ...doctorInput,
      ...mediaFields,
      documents: [...doctorInput.documents, ...(mediaFields.documents ?? [])],
    });

    return this.toDto(doctor);
  }

  public async update(
    id: string,
    input: UpdateDoctorInput,
    context: DoctorAccessContext,
  ): Promise<DoctorDto> {
    const doctor = await this.findExistingDoctor(id);
    this.assertCanAccessDoctor(doctor, context);

    if (context.role !== UserRole.ADMIN) {
      this.rejectDoctorManagedFields(input);
    }

    await this.assertUniqueFields(input, id);

    const updatedDoctor = await this.doctorsRepository.updateById(
      id,
      input,
    );

    if (!updatedDoctor) {
      throw new NotFoundError('Doctor profile not found');
    }

    return this.toDto(updatedDoctor);
  }

  public async updateFromForm(
    id: string,
    input: DoctorUpdateFormInput,
    files: DoctorUploadedFiles | undefined,
    context: DoctorAccessContext,
  ): Promise<DoctorDto> {
    const { documentCategories, ...doctorInput } = input;
    const doctor = await this.findExistingDoctor(id);
    this.assertCanAccessDoctor(doctor, context);

    if (context.role !== UserRole.ADMIN) {
      this.rejectDoctorManagedFields(doctorInput);
    }

    await this.assertUniqueFields(doctorInput, id);

    const mediaFields =
      context.role === UserRole.ADMIN
        ? await this.uploadFormFiles(files, documentCategories, context.userId)
        : {};
    const documents = this.mergeDocumentIds(doctor, doctorInput.documents, mediaFields.documents);

    const updatedDoctor = await this.doctorsRepository.updateById(id, {
      ...doctorInput,
      ...mediaFields,
      documents,
    });

    if (!updatedDoctor) {
      throw new NotFoundError('Doctor profile not found');
    }

    return this.toDto(updatedDoctor);
  }

  public async delete(id: string, context: DoctorAccessContext): Promise<{ id: string }> {
    this.assertAdmin(context);

    const doctor = await this.doctorsRepository.softDeleteById(id);

    if (!doctor) {
      throw new NotFoundError('Doctor profile not found');
    }

    return { id };
  }

  private async findExistingDoctor(id: string): Promise<IDoctorDocument> {
    const doctor = await this.doctorsRepository.findById(id);

    if (!doctor) {
      throw new NotFoundError('Doctor profile not found');
    }

    return doctor;
  }

  private async assertUniqueFields(input: UpdateDoctorInput, excludeId?: string): Promise<void> {
    const checks: Array<Promise<boolean>> = [];
    const messages: string[] = [];

    if (input.email) {
      checks.push(this.doctorsRepository.existsByEmail(input.email, excludeId));
      messages.push('Email already exists');
    }

    if (input.phoneNumber) {
      checks.push(this.doctorsRepository.existsByPhoneNumber(input.phoneNumber, excludeId));
      messages.push('Phone number already exists');
    }

    if (input.licenseNumber) {
      checks.push(this.doctorsRepository.existsByLicenseNumber(input.licenseNumber, excludeId));
      messages.push('License number already exists');
    }

    const results = await Promise.all(checks);
    const conflictIndex = results.findIndex(Boolean);

    if (conflictIndex >= 0) {
      throw new ConflictError(messages[conflictIndex]);
    }
  }

  private assertCanAccessDoctor(doctor: IDoctorDocument, context: DoctorAccessContext): void {
    if (context.role === UserRole.ADMIN) {
      return;
    }

    if (context.role === UserRole.DOCTOR && String(doctor.userId) === context.userId) {
      return;
    }

    throw new AuthorizationError('Forbidden');
  }

  private assertAdmin(context: DoctorAccessContext): void {
    if (context.role !== UserRole.ADMIN) {
      throw new AuthorizationError('Forbidden');
    }
  }

  private assertDoctor(context: DoctorAccessContext): void {
    if (context.role !== UserRole.DOCTOR) {
      throw new AuthorizationError('Forbidden');
    }
  }

  private rejectDoctorManagedFields(input: UpdateDoctorInput): void {
    if (
      input.userId ||
      typeof input.isActive === 'boolean' ||
      input.licenseNumber ||
      input.documents ||
      input.profileImage
    ) {
      throw new AuthorizationError('Doctors cannot update managed profile fields');
    }
  }

  private async uploadFormFiles(
    files: DoctorUploadedFiles | undefined,
    documentCategories: DocumentFileCategory[] | undefined,
    uploadedBy: string,
  ): Promise<Pick<UpdateDoctorInput, 'profileImage' | 'documents'>> {
    const profileImageFile = files?.profileImage?.[0];
    const documentFiles = files?.documents ?? [];
    const result: Pick<UpdateDoctorInput, 'profileImage' | 'documents'> = {};

    if (profileImageFile) {
      const profileImage = await this.filesService.upload({
        file: profileImageFile,
        category: ImageFileCategory.PROFILE_IMAGE,
        uploadedBy,
      });
      result.profileImage = profileImage.id;
    }

    if (documentFiles.length > 0) {
      const uploadedDocuments = await Promise.all(
        documentFiles.map((file, index) =>
          this.filesService.upload({
            file,
            category: documentCategories?.[index] ?? DocumentFileCategory.OTHER,
            uploadedBy,
          }),
        ),
      );
      result.documents = uploadedDocuments.map((file) => file.id);
    }

    return result;
  }

  private mergeDocumentIds(
    doctor: IDoctorDocument,
    requestedDocumentIds: string[] | undefined,
    uploadedDocumentIds: string[] | undefined,
  ): string[] {
    const baseDocumentIds = requestedDocumentIds ?? this.getDoctorDocumentIds(doctor);
    return [...baseDocumentIds, ...(uploadedDocumentIds ?? [])];
  }

  private getDoctorDocumentIds(doctor: IDoctorDocument): string[] {
    if (!Array.isArray(doctor.documents)) {
      return [];
    }

    return doctor.documents.map((document) => String(document._id));
  }

  private toDto(doctor: IDoctorDocument): DoctorDto {
    const dto: DoctorDto = {
      id: String(doctor._id),
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phoneNumber: doctor.phoneNumber,
      gender: doctor.gender,
      dateOfBirth: doctor.dateOfBirth.toISOString(),
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      licenseNumber: doctor.licenseNumber,
      yearsOfExperience: doctor.yearsOfExperience,
      department: doctor.department,
      address: doctor.address,
      city: doctor.city,
      state: doctor.state,
      country: doctor.country,
      postalCode: doctor.postalCode,
      documents: this.mapFiles(doctor.documents),
      availabilityStatus: doctor.availabilityStatus,
      isActive: doctor.isActive,
      createdAt: doctor.createdAt.toISOString(),
      updatedAt: doctor.updatedAt.toISOString(),
    };

    if (doctor.userId) {
      dto.userId = String(doctor.userId);
    }

    if (typeof doctor.consultationFee === 'number') {
      dto.consultationFee = doctor.consultationFee;
    }

    if (doctor.profileImage && this.isPopulatedFile(doctor.profileImage)) {
      dto.profileImage = this.mapFile(doctor.profileImage);
    }

    return dto;
  }

  private mapFiles(files: unknown): FileDto[] {
    if (!Array.isArray(files)) {
      return [];
    }

    return files.filter((file): file is IFileDocument => this.isPopulatedFile(file)).map((file) =>
      this.mapFile(file),
    );
  }

  private mapFile(file: IFileDocument): FileDto {
    const dto: FileDto = {
      id: String(file._id),
      originalName: file.originalName,
      fileName: file.fileName,
      storageKey: file.storageKey,
      fileUrl: file.fileUrl,
      mimeType: file.mimeType,
      extension: file.extension,
      size: file.size,
      category: file.category,
      storageProvider: file.storageProvider,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString(),
    };

    if (file.uploadedBy) {
      dto.uploadedBy = String(file.uploadedBy);
    }

    if (file.metadata) {
      dto.metadata = file.metadata;
    }

    return dto;
  }

  private isPopulatedFile(file: unknown): file is IFileDocument {
    return typeof file === 'object' && file !== null && 'fileUrl' in file;
  }
}
