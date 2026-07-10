import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors.js';
import { AuthRepository } from './auth.repository.js';
import type { AuthUserPayload, LoginInput, RefreshTokenInput } from './auth.types.js';

export class AuthService {
  constructor(private readonly authRepository = new AuthRepository()) {}

  public async login(
    input: LoginInput,
  ): Promise<{ user: AuthUserPayload; accessToken: string; refreshToken: string }> {
    const user = await this.authRepository.findByEmail(input.email);

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    await this.authRepository.updateLastLogin(String(user._id));

    const accessToken = this.signToken(
      {
        id: String(user._id),
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
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
      },
      accessToken,
      refreshToken,
    };
  }

  public async refreshToken(input: RefreshTokenInput): Promise<{ accessToken: string }> {
    const token = input.refreshToken;

    if (!token) {
      throw new AppError('Invalid refresh token', 401);
    }

    const payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as AuthUserPayload & {
      iat?: number;
      exp?: number;
    };
    const user = await this.authRepository.findById(payload.id);

    if (!user || !user.isActive) {
      throw new AppError('Invalid refresh token', 401);
    }

    const accessToken = this.signToken(
      {
        id: String(user._id),
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      env.ACCESS_TOKEN_SECRET,
      env.ACCESS_TOKEN_EXPIRES_IN,
    );

    return { accessToken };
  }

  public async me(userId: string): Promise<AuthUserPayload> {
    const user = await this.authRepository.findById(userId);

    if (!user || !user.isActive) {
      throw new AppError('User not found', 404);
    }

    return {
      id: String(user._id),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  private signToken(payload: AuthUserPayload, secret: string, expiresIn: string): string {
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }
}
