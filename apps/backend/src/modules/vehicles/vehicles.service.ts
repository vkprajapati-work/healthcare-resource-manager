import { AuthorizationError, ConflictError, NotFoundError } from '../../shared/errors.js';
import { BadRequestError } from '../../shared/errors.js';
import { UserRole } from '../auth/auth.types.js';
import { DocumentFileCategory, FileCategory } from '../files/files.types.js';
import { FilesService } from '../files/files.service.js';
import type { FileDto, IFileDocument } from '../files/files.types.js';
import { DriversRepository } from '../drivers/drivers.repository.js';
import { VehiclesRepository } from './vehicles.repository.js';
import type {
  IVehicleDocument,
  UpdateVehicleInput,
  VehicleAccessContext,
  VehicleDto,
  VehicleFormInput,
  VehicleListMeta,
  VehicleListQuery,
  VehicleUpdateFormInput,
  VehicleUploadedFiles,
} from './vehicles.types.js';

export class VehiclesService {
  constructor(
    private readonly vehiclesRepository = new VehiclesRepository(),
    private readonly driversRepository = new DriversRepository(),
    private readonly filesService = new FilesService(),
  ) {}

  public async list(
    query: VehicleListQuery,
    context: VehicleAccessContext,
  ): Promise<{ vehicles: VehicleDto[]; meta: VehicleListMeta }> {
    this.assertCanReadVehicles(context);

    const [vehicles, total] = await Promise.all([
      this.vehiclesRepository.findMany(query),
      this.vehiclesRepository.countMany(query),
    ]);

    return {
      vehicles: vehicles.map((vehicle) => this.toDto(vehicle)),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  public async getById(id: string, context: VehicleAccessContext): Promise<VehicleDto> {
    const vehicle = await this.findExistingVehicle(id);
    await this.assertCanAccessVehicle(vehicle, context);
    return this.toDto(vehicle);
  }

  public async getAssignedVehicle(context: VehicleAccessContext): Promise<VehicleDto> {
    this.assertEvocDriver(context);

    const driver = await this.driversRepository.findByUserId(context.userId);

    if (!driver) {
      throw new NotFoundError('Driver profile not found');
    }

    const assignedVehicleId = this.getRefId(driver.assignedVehicle);

    if (!assignedVehicleId) {
      throw new NotFoundError('Assigned vehicle not found');
    }

    return this.getById(assignedVehicleId, context);
  }

  public async createFromForm(
    input: VehicleFormInput,
    files: VehicleUploadedFiles | undefined,
    context: VehicleAccessContext,
  ): Promise<VehicleDto> {
    const { documentCategories, ...vehicleInput } = input;
    this.assertAdmin(context);
    await this.assertUniqueFields(vehicleInput);
    await this.assertDriverCanBeAssigned(vehicleInput.assignedDriver);

    const mediaFields = await this.uploadFormFiles(files, documentCategories, context.userId);
    const photos = [...vehicleInput.photos, ...(mediaFields.photos ?? [])];

    if (photos.length === 0) {
      throw new BadRequestError('At least one vehicle photo is required');
    }

    const vehicle = await this.vehiclesRepository.create({
      ...vehicleInput,
      ...mediaFields,
      photos,
      documents: [...vehicleInput.documents, ...(mediaFields.documents ?? [])],
    });

    if (vehicleInput.assignedDriver) {
      await this.driversRepository.setAssignedVehicle(vehicleInput.assignedDriver, String(vehicle._id));
    }

    return this.toDto(await this.findExistingVehicle(String(vehicle._id)));
  }

  public async updateFromForm(
    id: string,
    input: VehicleUpdateFormInput,
    files: VehicleUploadedFiles | undefined,
    context: VehicleAccessContext,
  ): Promise<VehicleDto> {
    const { documentCategories, ...vehicleInput } = input;
    const vehicle = await this.findExistingVehicle(id);
    this.assertAdmin(context);

    await this.assertUniqueFields(vehicleInput, id);
    await this.assertDriverCanBeAssigned(vehicleInput.assignedDriver, id);

    const mediaFields = await this.uploadFormFiles(files, documentCategories, context.userId);
    const previousDriverId = this.getRefId(vehicle.assignedDriver);
    const nextDriverId = vehicleInput.assignedDriver;
    const photos = this.mergeFileIds(vehicle.photos, vehicleInput.photos, mediaFields.photos);
    const documents = this.mergeFileIds(
      vehicle.documents,
      vehicleInput.documents,
      mediaFields.documents,
    );

    const updatedVehicle = await this.vehiclesRepository.updateById(id, {
      ...vehicleInput,
      ...mediaFields,
      photos,
      documents,
    });

    if (!updatedVehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    if (typeof nextDriverId === 'string') {
      await this.syncVehicleDriverAssignment(id, previousDriverId, nextDriverId);
    }

    return this.toDto(await this.findExistingVehicle(id));
  }

  public async delete(id: string, context: VehicleAccessContext): Promise<{ id: string }> {
    this.assertAdmin(context);

    const vehicle = await this.findExistingVehicle(id);
    const assignedDriverId = this.getRefId(vehicle.assignedDriver);
    const deletedVehicle = await this.vehiclesRepository.softDeleteById(id);

    if (!deletedVehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    if (assignedDriverId) {
      await this.driversRepository.clearAssignedVehicle(assignedDriverId);
    }

    return { id };
  }

  private async findExistingVehicle(id: string): Promise<IVehicleDocument> {
    const vehicle = await this.vehiclesRepository.findById(id);

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    return vehicle;
  }

  private async assertUniqueFields(input: UpdateVehicleInput, excludeId?: string): Promise<void> {
    const checks: Array<Promise<boolean>> = [];
    const messages: string[] = [];

    if (input.registrationNumber) {
      checks.push(
        this.vehiclesRepository.existsByRegistrationNumber(input.registrationNumber, excludeId),
      );
      messages.push('Registration number already exists');
    }

    if (input.vehicleNumber) {
      checks.push(this.vehiclesRepository.existsByVehicleNumber(input.vehicleNumber, excludeId));
      messages.push('Vehicle number already exists');
    }

    const results = await Promise.all(checks);
    const conflictIndex = results.findIndex(Boolean);

    if (conflictIndex >= 0) {
      throw new ConflictError(messages[conflictIndex]);
    }
  }

  private async assertDriverCanBeAssigned(
    driverId: string | undefined,
    vehicleId?: string,
  ): Promise<void> {
    if (!driverId) {
      return;
    }

    const driver = await this.driversRepository.findById(driverId);

    if (!driver || !driver.isActive) {
      throw new NotFoundError('Driver not found');
    }

    const assignedVehicleId = this.getRefId(driver.assignedVehicle);

    if (assignedVehicleId && assignedVehicleId !== vehicleId) {
      throw new ConflictError('Driver is already assigned to another vehicle');
    }

    const activeVehicle = await this.vehiclesRepository.findActiveByAssignedDriver(
      driverId,
      vehicleId,
    );

    if (activeVehicle) {
      throw new ConflictError('Driver is already assigned to another active vehicle');
    }
  }

  private async syncVehicleDriverAssignment(
    vehicleId: string,
    previousDriverId: string | undefined,
    nextDriverId: string,
  ): Promise<void> {
    if (previousDriverId && previousDriverId !== nextDriverId) {
      await this.driversRepository.clearAssignedVehicle(previousDriverId);
    }

    await this.driversRepository.setAssignedVehicle(nextDriverId, vehicleId);
  }

  private assertCanReadVehicles(context: VehicleAccessContext): void {
    if (context.role === UserRole.ADMIN || context.role === UserRole.DOCTOR) {
      return;
    }

    throw new AuthorizationError('Forbidden');
  }

  private async assertCanAccessVehicle(
    vehicle: IVehicleDocument,
    context: VehicleAccessContext,
  ): Promise<void> {
    if (context.role === UserRole.ADMIN || context.role === UserRole.DOCTOR) {
      return;
    }

    if (context.role === UserRole.EVOC_DRIVER) {
      const driver = await this.driversRepository.findByUserId(context.userId);
      const assignedVehicleId = driver ? this.getRefId(driver.assignedVehicle) : undefined;

      if (assignedVehicleId === String(vehicle._id)) {
        return;
      }
    }

    throw new AuthorizationError('Forbidden');
  }

  private assertAdmin(context: VehicleAccessContext): void {
    if (context.role !== UserRole.ADMIN) {
      throw new AuthorizationError('Forbidden');
    }
  }

  private assertEvocDriver(context: VehicleAccessContext): void {
    if (context.role !== UserRole.EVOC_DRIVER) {
      throw new AuthorizationError('Forbidden');
    }
  }

  private async uploadFormFiles(
    files: VehicleUploadedFiles | undefined,
    documentCategories: DocumentFileCategory[] | undefined,
    uploadedBy: string,
  ): Promise<Pick<UpdateVehicleInput, 'photos' | 'documents'>> {
    const photoFiles = files?.photos ?? [];
    const documentFiles = files?.documents ?? [];
    const result: Pick<UpdateVehicleInput, 'photos' | 'documents'> = {};

    if (photoFiles.length > 0) {
      const uploadedPhotos = await Promise.all(
        photoFiles.map((file) =>
          this.filesService.upload({
            file,
            category: FileCategory.VEHICLE_PHOTO,
            uploadedBy,
          }),
        ),
      );
      result.photos = uploadedPhotos.map((file) => file.id);
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

  private mergeFileIds(
    currentFiles: unknown,
    requestedFileIds: string[] | undefined,
    uploadedFileIds: string[] | undefined,
  ): string[] {
    const baseFileIds = requestedFileIds ?? this.getFileIds(currentFiles);
    return [...baseFileIds, ...(uploadedFileIds ?? [])];
  }

  private getFileIds(files: unknown): string[] {
    if (!Array.isArray(files)) {
      return [];
    }

    return files.map((file) => this.getRefId(file)).filter((id): id is string => !!id);
  }

  private toDto(vehicle: IVehicleDocument): VehicleDto {
    const dto: VehicleDto = {
      id: String(vehicle._id),
      registrationNumber: vehicle.registrationNumber,
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model,
      manufactureYear: vehicle.manufactureYear,
      color: vehicle.color,
      seatingCapacity: vehicle.seatingCapacity,
      patientCapacity: vehicle.patientCapacity,
      photos: this.mapFiles(vehicle.photos),
      documents: this.mapFiles(vehicle.documents),
      insuranceExpiry: vehicle.insuranceExpiry.toISOString(),
      fitnessExpiry: vehicle.fitnessExpiry.toISOString(),
      pollutionExpiry: vehicle.pollutionExpiry.toISOString(),
      status: vehicle.status,
      isActive: vehicle.isActive,
      createdAt: vehicle.createdAt.toISOString(),
      updatedAt: vehicle.updatedAt.toISOString(),
    };

    const assignedDriverId = this.getRefId(vehicle.assignedDriver);
    if (assignedDriverId) {
      dto.assignedDriver = assignedDriverId;
    }

    if (vehicle.lastServiceDate) {
      dto.lastServiceDate = vehicle.lastServiceDate.toISOString();
    }

    if (vehicle.nextServiceDate) {
      dto.nextServiceDate = vehicle.nextServiceDate.toISOString();
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
