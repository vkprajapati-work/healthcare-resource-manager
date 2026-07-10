import { UserModel } from './auth.model.js';
import type { IUserDocument } from './auth.types.js';

export class AuthRepository {
  public async findByEmail(email: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ email }).lean<IUserDocument>().exec();
  }

  public async findById(id: string): Promise<IUserDocument | null> {
    return UserModel.findById(id).lean<IUserDocument>().exec();
  }

  public async create(user: Partial<IUserDocument>): Promise<IUserDocument> {
    const createdUser = await UserModel.create(user);
    return createdUser.toObject() as IUserDocument;
  }

  public async updateLastLogin(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { lastLoginAt: new Date() });
  }

  public async updatePassword(id: string, password: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, {
      password,
      mustChangePassword: false,
    });
  }
}
