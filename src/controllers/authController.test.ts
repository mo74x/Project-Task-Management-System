import { Request, Response, NextFunction } from 'express';
import { register, login } from './authController';
import * as authService from '../services/authService';

// Mock the service layer
jest.mock('../services/authService');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockNext = jest.fn();

    mockRequest = {
      body: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      },
    };

    mockResponse = {
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return 201 on successful registration', async () => {
      const serviceResult = {
        token: 'mock-jwt-token',
        user: { id: 'uuid-123', name: 'Test User', email: 'test@example.com' },
      };

      (authService.registerUser as jest.Mock).mockResolvedValue(serviceResult);

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(authService.registerUser).toHaveBeenCalledWith(mockRequest.body);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'User registered successfully',
        ...serviceResult,
      });
    });

    it('should call next(error) when service throws', async () => {
      const error: any = new Error('User with this email already exists');
      error.statusCode = 400;
      (authService.registerUser as jest.Mock).mockRejectedValue(error);

      await register(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockStatus).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return 200 on successful login', async () => {
      mockRequest.body = { email: 'test@example.com', password: 'password123' };
      const serviceResult = {
        token: 'mock-jwt-token',
        user: { id: 'uuid-123', name: 'Test User', email: 'test@example.com' },
      };

      (authService.loginUser as jest.Mock).mockResolvedValue(serviceResult);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(authService.loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Login successful',
        ...serviceResult,
      });
    });

    it('should call next(error) when service throws', async () => {
      mockRequest.body = { email: 'test@example.com', password: 'wrong' };
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      (authService.loginUser as jest.Mock).mockRejectedValue(error);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockStatus).not.toHaveBeenCalled();
    });
  });
});