import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AuthenticationError, ConflictError, NotFoundError } from '../../shared/errors.js';
import type { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { UserRole, type IUserDocument } from './auth.types.js';

const PASSWORD = 'CorrectHorseBattery1';
const PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 4);
const USER_ID = '665f1c2e8b3e2a0012345678';

const buildUser = (overrides: Partial<IUserDocument> = {}): IUserDocument =>
  ({
    _id: USER_ID,
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    password: PASSWORD_HASH,
    role: UserRole.ADMIN,
    isActive: true,
    mustChangePassword: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  }) as unknown as IUserDocument;

const buildMockRepository = () => ({
  findByEmail: jest.fn<(email: string) => Promise<IUserDocument | null>>(),
  findByEmailWithPassword: jest.fn<(email: string) => Promise<IUserDocument | null>>(),
  findById: jest.fn<(id: string) => Promise<IUserDocument | null>>(),
  findByIdWithPassword: jest.fn<(id: string) => Promise<IUserDocument | null>>(),
  create: jest.fn<(user: Partial<IUserDocument>) => Promise<IUserDocument>>(),
  updateLastLogin: jest.fn<(id: string) => Promise<void>>(),
  updatePassword: jest.fn<(id: string, password: string) => Promise<void>>(),
});

describe('AuthService', () => {
  let repository: ReturnType<typeof buildMockRepository>;
  let service: AuthService;

  beforeEach(() => {
    repository = buildMockRepository();
    service = new AuthService(repository as unknown as AuthRepository);
  });

  describe('login', () => {
    it('throws AuthenticationError when no user has that email', async () => {
      repository.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: PASSWORD }),
      ).rejects.toThrow(AuthenticationError);
    });

    it('throws AuthenticationError when the user is inactive', async () => {
      repository.findByEmailWithPassword.mockResolvedValue(buildUser({ isActive: false }));

      await expect(service.login({ email: 'ada@example.com', password: PASSWORD })).rejects.toThrow(
        AuthenticationError,
      );
    });

    it('throws AuthenticationError when the password is wrong', async () => {
      repository.findByEmailWithPassword.mockResolvedValue(buildUser());

      await expect(
        service.login({ email: 'ada@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(AuthenticationError);
    });

    it('records the login and returns signed tokens plus the user payload on success', async () => {
      repository.findByEmailWithPassword.mockResolvedValue(buildUser());

      const result = await service.login({ email: 'ada@example.com', password: PASSWORD });

      expect(repository.updateLastLogin).toHaveBeenCalledWith(USER_ID);
      expect(result.user).toEqual({
        id: USER_ID,
        email: 'ada@example.com',
        role: UserRole.ADMIN,
        firstName: 'Ada',
        lastName: 'Lovelace',
        mustChangePassword: false,
      });

      const accessPayload = jwt.verify(result.accessToken, env.ACCESS_TOKEN_SECRET) as {
        id: string;
      };
      const refreshPayload = jwt.verify(result.refreshToken, env.REFRESH_TOKEN_SECRET) as {
        id: string;
      };
      expect(accessPayload.id).toBe(USER_ID);
      expect(refreshPayload.id).toBe(USER_ID);
    });
  });

  describe('refreshToken', () => {
    it('throws AuthenticationError when no token is provided', async () => {
      await expect(service.refreshToken({})).rejects.toThrow(AuthenticationError);
    });

    it('throws AuthenticationError for a malformed token', async () => {
      await expect(service.refreshToken({ refreshToken: 'not-a-jwt' })).rejects.toThrow(
        AuthenticationError,
      );
    });

    it('throws an expiry-specific AuthenticationError for an expired token', async () => {
      const expired = jwt.sign({ id: USER_ID }, env.REFRESH_TOKEN_SECRET, { expiresIn: -10 });

      await expect(service.refreshToken({ refreshToken: expired })).rejects.toThrow(
        'Refresh token has expired',
      );
    });

    it('throws AuthenticationError when the token is valid but the user no longer exists', async () => {
      const token = jwt.sign({ id: 'missing-user' }, env.REFRESH_TOKEN_SECRET, { expiresIn: '1h' });
      repository.findById.mockResolvedValue(null);

      await expect(service.refreshToken({ refreshToken: token })).rejects.toThrow(
        AuthenticationError,
      );
    });

    it('throws AuthenticationError when the token is valid but the user is inactive', async () => {
      const token = jwt.sign({ id: USER_ID }, env.REFRESH_TOKEN_SECRET, { expiresIn: '1h' });
      repository.findById.mockResolvedValue(buildUser({ isActive: false }));

      await expect(service.refreshToken({ refreshToken: token })).rejects.toThrow(
        AuthenticationError,
      );
    });

    it('returns a freshly signed access token when the refresh token is valid', async () => {
      const token = jwt.sign({ id: USER_ID }, env.REFRESH_TOKEN_SECRET, { expiresIn: '1h' });
      repository.findById.mockResolvedValue(buildUser());

      const result = await service.refreshToken({ refreshToken: token });

      const payload = jwt.verify(result.accessToken, env.ACCESS_TOKEN_SECRET) as { id: string };
      expect(payload.id).toBe(USER_ID);
    });
  });

  describe('me', () => {
    it('throws NotFoundError when the user does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.me('missing-id')).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError when the user is inactive', async () => {
      repository.findById.mockResolvedValue(buildUser({ isActive: false }));

      await expect(service.me(USER_ID)).rejects.toThrow(NotFoundError);
    });

    it('returns the mapped user payload', async () => {
      repository.findById.mockResolvedValue(buildUser());

      const result = await service.me(USER_ID);

      expect(result).toEqual({
        id: USER_ID,
        email: 'ada@example.com',
        role: UserRole.ADMIN,
        firstName: 'Ada',
        lastName: 'Lovelace',
        mustChangePassword: false,
      });
    });
  });

  describe('changePassword', () => {
    it('throws NotFoundError when the user does not exist', async () => {
      repository.findByIdWithPassword.mockResolvedValue(null);

      await expect(
        service.changePassword('missing-id', {
          currentPassword: PASSWORD,
          newPassword: 'NewPassw0rd',
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it('throws AuthenticationError when the current password is wrong', async () => {
      repository.findByIdWithPassword.mockResolvedValue(buildUser());

      await expect(
        service.changePassword(USER_ID, {
          currentPassword: 'wrong-password',
          newPassword: 'NewPassw0rd',
        }),
      ).rejects.toThrow(AuthenticationError);
    });

    it('hashes and persists the new password on success', async () => {
      repository.findByIdWithPassword.mockResolvedValue(buildUser());

      await service.changePassword(USER_ID, {
        currentPassword: PASSWORD,
        newPassword: 'NewPassw0rd',
      });

      expect(repository.updatePassword).toHaveBeenCalledWith(USER_ID, expect.any(String));
      const hashedPassword = repository.updatePassword.mock.calls[0]?.[1] ?? '';
      await expect(bcrypt.compare('NewPassw0rd', hashedPassword)).resolves.toBe(true);
    });
  });

  describe('provisionUser', () => {
    it('throws ConflictError when the email is already registered', async () => {
      repository.findByEmail.mockResolvedValue(buildUser());

      await expect(
        service.provisionUser({
          firstName: 'New',
          lastName: 'User',
          email: 'ada@example.com',
          role: UserRole.DOCTOR,
        }),
      ).rejects.toThrow(ConflictError);
    });

    it('creates the user with a hashed one-time password and mustChangePassword=true', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(buildUser({ mustChangePassword: true }));

      const result = await service.provisionUser({
        firstName: 'New',
        lastName: 'User',
        email: 'new.user@example.com',
        role: UserRole.DOCTOR,
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'New',
          lastName: 'User',
          email: 'new.user@example.com',
          role: UserRole.DOCTOR,
          isActive: true,
          mustChangePassword: true,
          password: expect.any(String),
        }),
      );
      const hashedPassword = repository.create.mock.calls[0]?.[0]?.password ?? '';
      await expect(bcrypt.compare(result.defaultPassword, hashedPassword)).resolves.toBe(true);
    });
  });
});
