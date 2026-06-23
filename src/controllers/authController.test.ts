import { Request, Response } from 'express';
import { register } from './authController';
import { AppDataSource } from '../config/database';

//mock database configuration
jest.mock('../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    }),
  },
}));

describe('Auth Controller - Register', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    //fake Express req and res objects
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
  });

  it('should return 400 if user already exists', async () => {
    const userRepository = AppDataSource.getRepository('User');
    
    //simulate finding an existing user
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: '1', email: 'test@example.com' });

    await register(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({ message: 'User with this email already exists' });
  });

  it('should successfully register a new user', async () => {
    const userRepository = AppDataSource.getRepository('User');
    
    //simulate no user existing
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);
    
    //creating and saving the user
    const newUser = { id: 'uuid-123', name: 'Test User', email: 'test@example.com', role: 'Member' };
    (userRepository.create as jest.Mock).mockReturnValue(newUser);
    (userRepository.save as jest.Mock).mockResolvedValue(newUser);

    await register(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'User registered successfully',
        token: expect.any(String), //expect a token
      })
    );
  });
});