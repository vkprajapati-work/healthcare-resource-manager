import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';
import { UserModel } from './auth.model.js';
import { UserRole } from './auth.types.js';

export const seedDefaultAdmin = async (): Promise<void> => {
  const existingAdmin = await UserModel.findOne({ email: env.ADMIN_EMAIL }).exec();

  if (existingAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 12);

  await UserModel.create({
    firstName: env.ADMIN_FIRST_NAME,
    lastName: env.ADMIN_LAST_NAME,
    email: env.ADMIN_EMAIL,
    password: hashedPassword,
    role: UserRole.ADMIN,
    isActive: true,
  });
};
