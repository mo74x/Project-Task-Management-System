import { Request, Response, NextFunction } from 'express';
import { authenticate } from './auth';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Auth Middleware (authenticate)', () => {
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
      headers: {},
    };

    mockResponse = {
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  it('should return 401 if no authorization header is provided', () => {
    authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({ message: 'Access denied. No token provided.' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header does not start with "Bearer "', () => {
    mockRequest.headers = { authorization: 'Basic some-random-token' };

    authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({ message: 'Access denied. No token provided.' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 if the token is invalid or expired', () => {
    mockRequest.headers = { authorization: 'Bearer invalid-token' };
    
    // Simulate jwt.verify throwing an error
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('jwt expired');
    });

    authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({ message: 'Invalid or expired token.' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next() and populate req.user if the token is valid', () => {
    const mockDecodedToken = { id: 'uuid-123', role: 'Member' };
    mockRequest.headers = { authorization: 'Bearer valid-token' };

    (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

    authenticate(mockRequest as Request, mockResponse as Response, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
    
    expect((mockRequest as any).user).toEqual(mockDecodedToken);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockStatus).not.toHaveBeenCalled();
  });
});