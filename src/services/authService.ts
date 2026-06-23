import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

const userRepository = AppDataSource.getRepository(User);

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface AuthResult {
  token: string;
  user: { id: string; name: string; email: string };
}

export const registerUser = async (data: RegisterInput): Promise<AuthResult> => {
  const { name, email, password } = data;

  // Check if user already exists
  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) {
    const error: any = new Error('User with this email already exists');
    error.statusCode = 400;
    throw error;
  }

  // Hash password and save user
  const hashedPassword = await hashPassword(password);
  const newUser = userRepository.create({ name, email, password: hashedPassword });
  await userRepository.save(newUser);

  // Generate JWT token
  const token = generateToken(newUser.id, newUser.role);

  return {
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
  };
};

export const loginUser = async (email: string, password: string): Promise<AuthResult> => {
  // Find user by email
  const user = await userRepository.findOne({ where: { email } });
  if (!user) {
    const error: any = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    const error: any = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = generateToken(user.id, user.role);

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
};
