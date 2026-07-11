import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { generateSecurePassword } from '../../utils/password.js';
import { UserModel } from './auth.model.js';
import { UserRole } from './auth.types.js';

export const seedDefaultAdmin = async (): Promise<void> => {
  if (!env.ADMIN_EMAIL) {
    logger.warn(
      'ADMIN_EMAIL is not set - skipping default admin seed. Set ADMIN_EMAIL (and optionally ADMIN_PASSWORD) to provision an admin account.',
    );
    return;
  }

  const existingAdmin = await UserModel.findOne({ email: env.ADMIN_EMAIL }).exec();

  if (existingAdmin) {
    return;
  }

  const isGeneratedPassword = !env.ADMIN_PASSWORD;
  const password = env.ADMIN_PASSWORD ?? generateSecurePassword();
  const hashedPassword = await bcrypt.hash(password, 12);

  await UserModel.create({
    firstName: env.ADMIN_FIRST_NAME,
    lastName: env.ADMIN_LAST_NAME,
    email: env.ADMIN_EMAIL,
    password: hashedPassword,
    role: UserRole.ADMIN,
    isActive: true,
    mustChangePassword: isGeneratedPassword,
  });

  if (isGeneratedPassword) {
    logger.warn(
      `Seeded default admin account with a generated password (shown once - it will not be logged again): email=${env.ADMIN_EMAIL} password=${password}. Log in and change this password immediately; the account is locked to the change-password flow until you do.`,
    );
  }
};
