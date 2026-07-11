import { generateSecurePassword } from './password.js';

describe('generateSecurePassword', () => {
  it('generates a 16-character password by default', () => {
    expect(generateSecurePassword()).toHaveLength(16);
  });

  it('honors a custom length', () => {
    expect(generateSecurePassword(24)).toHaveLength(24);
  });

  it('only uses characters from the safe charset', () => {
    const password = generateSecurePassword(64);
    expect(password).toMatch(/^[A-Za-z0-9!@#$%^&*]+$/);
  });

  it('is not deterministic across calls', () => {
    const passwords = new Set(Array.from({ length: 20 }, () => generateSecurePassword()));
    expect(passwords.size).toBeGreaterThan(1);
  });
});
