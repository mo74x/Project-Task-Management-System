import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (userId: string, role: string): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  const secret: jwt.Secret = JWT_SECRET;
  return jwt.sign({ id: userId, role }, secret, {
    expiresIn: JWT_EXPIRES_IN as string | undefined as jwt.SignOptions['expiresIn'],
  });
};
