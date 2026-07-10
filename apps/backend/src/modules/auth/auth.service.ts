import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AuthenticationError, ConflictError, NotFoundError } from '../../errors/app-error.js';
import { AuthRepository } from './auth.repository.js';
import type {
  AuthUserPayload,
  ChangePasswordInput,
  LoginInput,
  ProvisionUserInput,
  RefreshTokenInput,
} from './auth.types.js';

export class AuthService {
  constructor(private readonly authRepository = new AuthRepository()) {}

  public async login(
    input: LoginInput,
  ): Promise<{ user: AuthUserPayload; accessToken: string; refreshToken: string }> {
    const user = await this.authRepository.findByEmail(input.email);

    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    await this.authRepository.updateLastLogin(String(user._id));

    const accessToken = this.signToken(
      {
        id: String(user._id),
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        mustChangePassword: user.mustChangePassword,
      },
      env.ACCESS_TOKEN_SECRET,
      env.ACCESS_TOKEN_EXPIRES_IN,
    );

    const refreshToken = this.signToken(
      {
        id: String(user._id),
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        mustChangePassword: user.mustChangePassword,
      },
      env.REFRESH_TOKEN_SECRET,
      env.REFRESH_TOKEN_EXPIRES_IN,
    );

    return {
      user: {
        id: String(user._id),
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        mustChangePassword: user.mustChangePassword,
      },
      accessToken,
      refreshToken,
    };
  }

  public async refreshToken(input: RefreshTokenInput): Promise<{ accessToken: string }> {
    const token = input.refreshToken;

    if (!token) {
      throw new AuthenticationError('Refresh token is required');
    }

    let payload: AuthUserPayload & { iat?: number; exp?: number };

    try {
      payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as AuthUserPayload & {
        iat?: number;
        exp?: number;
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Refresh token has expired');
      }

      throw new AuthenticationError('Invalid refresh token');
    }

    const user = await this.authRepository.findById(payload.id);

    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const accessToken = this.signToken(
      {
        id: String(user._id),
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        mustChangePassword: user.mustChangePassword,
      },
      env.ACCESS_TOKEN_SECRET,
      env.ACCESS_TOKEN_EXPIRES_IN,
    );

    return { accessToken };
  }

  public async me(userId: string): Promise<AuthUserPayload> {
    const user = await this.authRepository.findById(userId);

    if (!user || !user.isActive) {
      throw new NotFoundError('User not found');
    }

    return {
      id: String(user._id),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      mustChangePassword: user.mustChangePassword,
    };
  }

  public async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await this.authRepository.findById(userId);

    if (!user || !user.isActive) {
      throw new NotFoundError('User not found');
    }

    const isPasswordValid = await bcrypt.compare(input.currentPassword, user.password);

    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 12);
    await this.authRepository.updatePassword(String(user._id), hashedPassword);
  }

  public async provisionUser(
    input: ProvisionUserInput,
  ): Promise<{ id: string; defaultPassword: string }> {
    const existingUser = await this.authRepository.findByEmail(input.email);

    if (existingUser) {
      throw new ConflictError('User email already exists');
    }

    const defaultPassword = this.buildDefaultPassword(input.firstName, input.email);
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    const user = await this.authRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      isActive: true,
      mustChangePassword: true,
    });

    return {
      id: String(user._id),
      defaultPassword,
    };
  }

  private buildDefaultPassword(firstName: string, email: string): string {
    const normalizedName = this.normalizePasswordPart(firstName) || 'user';
    const emailName = this.normalizePasswordPart(email.split('@')[0] ?? '') || 'account';
    const displayName = `${normalizedName.charAt(0).toUpperCase()}${normalizedName.slice(1)}`;
    return `${displayName}@${emailName}#2026`;
  }

  private normalizePasswordPart(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  private signToken(payload: AuthUserPayload, secret: string, expiresIn: string): string {
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }
}
