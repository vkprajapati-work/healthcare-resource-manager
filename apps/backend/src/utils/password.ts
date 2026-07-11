import crypto from 'node:crypto';

const PASSWORD_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';

export const generateSecurePassword = (length = 16): string => {
  const bytes = crypto.randomBytes(length);
  let password = '';

  for (let i = 0; i < length; i += 1) {
    password += PASSWORD_CHARSET[(bytes[i] ?? 0) % PASSWORD_CHARSET.length];
  }

  return password;
};
