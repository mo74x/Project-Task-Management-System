import { AppDataSource } from '../config/database';
import * as authUtils from '../utils/auth';

// Setup Mock for AppDataSource inside factory to avoid temporal dead zone
jest.mock('../config/database', () => {
  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  return {
    AppDataSource: {
      getRepository: jest.fn(() => mockRepo),
    },
  };
});

jest.mock('../utils/auth', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  generateToken: jest.fn(),
}));

// Import service after mock setup
import { registerUser, loginUser } from './authService';

const mockUserRepository = AppDataSource.getRepository(null as any) as jest.Mocked<any>;

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    const registerData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should register a user successfully and return access token', async () => {
      // Setup mocks
      mockUserRepository.findOne.mockResolvedValue(null);
      (authUtils.hashPassword as jest.Mock).mockResolvedValue('hashed_password');
      mockUserRepository.create.mockReturnValue({
        id: 'user-uuid',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Member',
      });
      mockUserRepository.save.mockResolvedValue({});
      (authUtils.generateToken as jest.Mock).mockReturnValue('jwt-token-123');

      const result = await registerUser(registerData);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(authUtils.hashPassword).toHaveBeenCalledWith('password123');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(authUtils.generateToken).toHaveBeenCalledWith('user-uuid', 'Member');

      expect(result).toEqual({
        token: 'jwt-token-123',
        user: {
          id: 'user-uuid',
          name: 'John Doe',
          email: 'john@example.com',
        },
      });
    });

    it('should throw an error if the email is already registered', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 'existing-id' });

      await expect(registerUser(registerData)).rejects.toThrow(
        'User with this email already exists'
      );
      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    it('should login a user successfully and return token', async () => {
      const dbUser = {
        id: 'user-uuid',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        role: 'Member',
      };

      mockUserRepository.findOne.mockResolvedValue(dbUser);
      (authUtils.comparePassword as jest.Mock).mockResolvedValue(true);
      (authUtils.generateToken as jest.Mock).mockReturnValue('jwt-token-123');

      const result = await loginUser('john@example.com', 'password123');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(authUtils.comparePassword).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(authUtils.generateToken).toHaveBeenCalledWith('user-uuid', 'Member');
      expect(result).toEqual({
        token: 'jwt-token-123',
        user: {
          id: 'user-uuid',
          name: 'John Doe',
          email: 'john@example.com',
        },
      });
    });

    it('should throw 401 if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(loginUser('john@example.com', 'password123')).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should throw 401 if password check fails', async () => {
      const dbUser = {
        id: 'user-uuid',
        password: 'hashed_password',
      };
      mockUserRepository.findOne.mockResolvedValue(dbUser);
      (authUtils.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(loginUser('john@example.com', 'password123')).rejects.toThrow(
        'Invalid email or password'
      );
    });
  });
});
