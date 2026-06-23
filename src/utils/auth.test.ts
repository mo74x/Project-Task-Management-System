import { hashPassword, comparePassword, generateToken } from './auth';
import jwt from 'jsonwebtoken';

describe('Auth Utilities', () => {
  const plainPassword = 'mySuperSecretPassword123';
  let hashedPassword = '';

  it('should hash a password securely', async () => {
    hashedPassword = await hashPassword(plainPassword);
    
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(plainPassword);
    expect(hashedPassword.length).toBeGreaterThan(20);
  });

  it('should verify a correct password', async () => {
    const isValid = await comparePassword(plainPassword, hashedPassword);
    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const isValid = await comparePassword('wrongPassword', hashedPassword);
    expect(isValid).toBe(false);
  });

  it('should generate a valid JWT token', () => {
    const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
    const mockRole = 'Admin';
    
    const token = generateToken(mockUserId, mockRole);
    expect(token).toBeDefined();

    // Decode to verify contents
    const decoded = jwt.decode(token) as any;
    expect(decoded.id).toBe(mockUserId);
    expect(decoded.role).toBe(mockRole);
  });
});