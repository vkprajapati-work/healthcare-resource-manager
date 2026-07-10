import { AuthorizationError, ConflictError, NotFoundError } from '../../shared/errors.js';
import { AuthService } from '../auth/auth.service.js';
import { UserRole } from '../auth/auth.types.js';
import { DocumentFileCategory, ImageFileCategory } from '../files/files.types.js';
import { FilesService } from '../files/files.service.js';
import type { FileDto, IFileDocument } from '../files/files.types.js';
import { VehiclesRepository } from '../vehicles/vehicles.repository.js';
import { DriversRepository } from './drivers.repository.js';
import type {
  DriverAccessContext,
  DriverCreateResult,
  DriverDto,
  DriverFormInput,
  DriverListMeta,
  DriverListQuery,
  DriverUploadedFiles,
  DriverUpdateFormInput,
  IDriverDocument,
  UpdateDriverInput,
} from './drivers.types.js';

export class DriversService {
  constructor(
    private readonly driversRepository = new DriversRepository(),
    private readonly vehiclesRepository = new VehiclesRepository(),
    private readonly filesService = new FilesService(),
    private readonly authService = new AuthService(),
  ) {}

  public async list(
    query: DriverListQuery,
    context: DriverAccessContext,
  ): Promise<{ drivers: DriverDto[]; meta: DriverListMeta }> {
    this.assertAdmin(context);

    const [drivers, total] = await Promise.all([
      this.driversRepository.findMany(query),
      this.driversRepository.countMany(query),
    ]);

    return {
      drivers: drivers.map((driver) => this.toDto(driver)),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  public async getById(id: string, context: DriverAccessContext): Promise<DriverDto> {
    const driver = await this.findExistingDriver(id);
    this.assertCanAccessDriver(driver, context);
    return this.toDto(driver);
  }

  public async getOwnProfile(context: DriverAccessContext): Promise<DriverDto> {
    this.assertEvocDriver(context);

    const driver = await this.driversRepository.findByUserId(context.userId);

    if (!driver) {
      throw new NotFoundError('Driver profile not found');
    }

    return this.toDto(driver);
  }

  public async createFromForm(
    input: DriverFormInput,
    files: DriverUploadedFiles | undefined,
    context: DriverAccessContext,
  ): Promise<DriverCreateResult> {
    const { documentCategories, ...driverInput } = input;
    this.assertAdmin(context);
    await this.assertUniqueFields(driverInput);
    await this.assertVehicleCanBeAssigned(driverInput.assignedVehicle);

    const mediaFields = await this.uploadFormFiles(files, documentCategories, context.userId);
    const { input: provisionedDriverInput, login } = await this.withProvisionedUser(driverInput);
    const driver = await this.driversRepository.create({
      ...provisionedDriverInput,
      ...mediaFields,
      documents: [...provisionedDriverInput.documents, ...(mediaFields.documents ?? [])],
    });

    if (driverInput.assignedVehicle) {
      await this.vehiclesRepository.setAssignedDriver(driverInput.assignedVehicle, String(driver._id));
    }

    return this.buildCreateResult(this.toDto(await this.findExistingDriver(String(driver._id))), login);
  }

  public async updateFromForm(
    id: string,
    input: DriverUpdateFormInput,
    files: DriverUploadedFiles | undefined,
    context: DriverAccessContext,
  ): Promise<DriverDto> {
    const { documentCategories, ...driverInput } = input;
    const driver = await this.findExistingDriver(id);
    this.assertCanAccessDriver(driver, context);

    if (context.role !== UserRole.ADMIN) {
      this.rejectDriverManagedFields(driverInput);
    }

    await this.assertUniqueFields(driverInput, id);
    await this.assertVehicleCanBeAssigned(driverInput.assignedVehicle, id);

    const mediaFields =
      context.role === UserRole.ADMIN
        ? await this.uploadFormFiles(files, documentCategories, context.userId)
        : {};
    const documents = this.mergeDocumentIds(driver, driverInput.documents, mediaFields.documents);
    const previousVehicleId = this.getRefId(driver.assignedVehicle);
    const nextVehicleId = driverInput.assignedVehicle;

    const updatedDriver = await this.driversRepository.updateById(id, {
      ...driverInput,
      ...mediaFields,
      documents,
    });

    if (!updatedDriver) {
      throw new NotFoundError('Driver profile not found');
    }

    if (context.role === UserRole.ADMIN && typeof nextVehicleId === 'string') {
      await this.syncDriverVehicleAssignment(id, previousVehicleId, nextVehicleId);
    }

    return this.toDto(await this.findExistingDriver(id));
  }

  public async delete(id: string, context: DriverAccessContext): Promise<{ id: string }> {
    this.assertAdmin(context);

    const driver = await this.findExistingDriver(id);
    const assignedVehicleId = this.getRefId(driver.assignedVehicle);
    const deletedDriver = await this.driversRepository.softDeleteById(id);

    if (!deletedDriver) {
      throw new NotFoundError('Driver profile not found');
    }

    if (assignedVehicleId) {
      await this.vehiclesRepository.clearAssignedDriver(assignedVehicleId);
    }

    return { id };
  }

  private async findExistingDriver(id: string): Promise<IDriverDocument> {
    const driver = await this.driversRepository.findById(id);

    if (!driver) {
      throw new NotFoundError('Driver profile not found');
    }

    return driver;
  }

  private async withProvisionedUser(
    input: DriverFormInput,
  ): Promise<{ input: DriverFormInput; login?: DriverCreateResult['login'] }> {
    if (input.userId) {
      return { input };
    }

    const user = await this.authService.provisionUser({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      role: UserRole.EVOC_DRIVER,
    });

    return {
      input: {
        ...input,
        userId: user.id,
      },
      login: {
        email: input.email,
        defaultPassword: user.defaultPassword,
        mustChangePassword: true,
      },
    };
  }

  private buildCreateResult(
    driver: DriverDto,
    login: DriverCreateResult['login'],
  ): DriverCreateResult {
    if (!login) {
      return { driver };
    }

    return { driver, login };
  }

  private async assertUniqueFields(input: UpdateDriverInput, excludeId?: string): Promise<void> {
    const checks: Array<Promise<boolean>> = [];
    const messages: string[] = [];

    if (input.email) {
      checks.push(this.driversRepository.existsByEmail(input.email, excludeId));
      messages.push('Email already exists');
    }

    if (input.phoneNumber) {
      checks.push(this.driversRepository.existsByPhoneNumber(input.phoneNumber, excludeId));
      messages.push('Phone number already exists');
    }

    if (input.employeeId) {
      checks.push(this.driversRepository.existsByEmployeeId(input.employeeId, excludeId));
      messages.push('Employee ID already exists');
    }

    if (input.licenseNumber) {
      checks.push(this.driversRepository.existsByLicenseNumber(input.licenseNumber, excludeId));
      messages.push('License number already exists');
    }

    const results = await Promise.all(checks);
    const conflictIndex = results.findIndex(Boolean);

    if (conflictIndex >= 0) {
      throw new ConflictError(messages[conflictIndex]);
    }
  }

  private async assertVehicleCanBeAssigned(
    vehicleId: string | undefined,
    driverId?: string,
  ): Promise<void> {
    if (!vehicleId) {
      return;
    }

    const vehicle = await this.vehiclesRepository.findById(vehicleId);

    if (!vehicle || !vehicle.isActive) {
      throw new NotFoundError('Vehicle not found');
    }

    const assignedDriverId = this.getRefId(vehicle.assignedDriver);

    if (assignedDriverId && assignedDriverId !== driverId) {
      throw new ConflictError('Vehicle is already assigned to another driver');
    }
  }

  private async syncDriverVehicleAssignment(
    driverId: string,
    previousVehicleId: string | undefined,
    nextVehicleId: string,
  ): Promise<void> {
    if (previousVehicleId && previousVehicleId !== nextVehicleId) {
      await this.vehiclesRepository.clearAssignedDriver(previousVehicleId);
    }

    await this.vehiclesRepository.setAssignedDriver(nextVehicleId, driverId);
  }

  private assertCanAccessDriver(driver: IDriverDocument, context: DriverAccessContext): void {
    if (context.role === UserRole.ADMIN) {
      return;
    }

    if (context.role === UserRole.EVOC_DRIVER && String(driver.userId) === context.userId) {
      return;
    }

    throw new AuthorizationError('Forbidden');
  }

  private assertAdmin(context: DriverAccessContext): void {
    if (context.role !== UserRole.ADMIN) {
      throw new AuthorizationError('Forbidden');
    }
  }

  private assertEvocDriver(context: DriverAccessContext): void {
    if (context.role !== UserRole.EVOC_DRIVER) {
      throw new AuthorizationError('Forbidden');
    }
  }

  private rejectDriverManagedFields(input: UpdateDriverInput): void {
    if (
      input.userId ||
      typeof input.isActive === 'boolean' ||
      input.employeeId ||
      input.licenseNumber ||
      input.licenseExpiry ||
      input.assignedVehicle ||
      input.documents ||
      input.profileImage
    ) {
      throw new AuthorizationError('Drivers cannot update managed profile fields');
    }
  }

  private async uploadFormFiles(
    files: DriverUploadedFiles | undefined,
    documentCategories: DocumentFileCategory[] | undefined,
    uploadedBy: string,
  ): Promise<Pick<UpdateDriverInput, 'profileImage' | 'documents'>> {
    const profileImageFile = files?.profileImage?.[0];
    const documentFiles = files?.documents ?? [];
    const result: Pick<UpdateDriverInput, 'profileImage' | 'documents'> = {};

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
    driver: IDriverDocument,
    requestedDocumentIds: string[] | undefined,
    uploadedDocumentIds: string[] | undefined,
  ): string[] {
    const baseDocumentIds = requestedDocumentIds ?? this.getDocumentIds(driver.documents);
    return [...baseDocumentIds, ...(uploadedDocumentIds ?? [])];
  }

  private getDocumentIds(documents: unknown): string[] {
    if (!Array.isArray(documents)) {
      return [];
    }

    return documents.map((document) => this.getRefId(document)).filter((id): id is string => !!id);
  }

  private toDto(driver: IDriverDocument): DriverDto {
    const dto: DriverDto = {
      id: String(driver._id),
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phoneNumber: driver.phoneNumber,
      gender: driver.gender,
      dateOfBirth: driver.dateOfBirth.toISOString(),
      employeeId: driver.employeeId,
      joiningDate: driver.joiningDate.toISOString(),
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry.toISOString(),
      yearsOfExperience: driver.yearsOfExperience,
      address: driver.address,
      city: driver.city,
      state: driver.state,
      country: driver.country,
      postalCode: driver.postalCode,
      documents: this.mapFiles(driver.documents),
      availabilityStatus: driver.availabilityStatus,
      isActive: driver.isActive,
      createdAt: driver.createdAt.toISOString(),
      updatedAt: driver.updatedAt.toISOString(),
    };

    if (driver.userId) {
      dto.userId = String(driver.userId);
    }

    const assignedVehicleId = this.getRefId(driver.assignedVehicle);
    if (assignedVehicleId) {
      dto.assignedVehicle = assignedVehicleId;
    }

    if (driver.profileImage && this.isPopulatedFile(driver.profileImage)) {
      dto.profileImage = this.mapFile(driver.profileImage);
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

  private getRefId(value: unknown): string | undefined {
    if (!value) {
      return undefined;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object' && '_id' in value) {
      return String(value._id);
    }

    return String(value);
  }
}
