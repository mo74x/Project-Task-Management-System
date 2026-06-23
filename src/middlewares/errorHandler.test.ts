import { Request, Response, NextFunction } from 'express';
import { errorHandler, notFoundHandler } from './errorHandler';

describe('Global Error Handlers', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  
  // Store the original environment to restore it later
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockNext = jest.fn();

    mockRequest = {
      originalUrl: '/api/some-missing-route',
    };

    mockResponse = {
      status: mockStatus,
    };

    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore original environment after tests finish
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  describe('notFoundHandler', () => {
    it('should return a 404 status and a formatted message containing the URL', () => {
      notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Route /api/some-missing-route not found',
      });
    });
  });

  describe('errorHandler', () => {
    it('should handle standard errors with a 500 status code', () => {
      const standardError = new Error('Database connection lost');

      errorHandler(standardError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('[Error]: Database connection lost');
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Database connection lost',
        })
      );
    });

    it('should handle custom errors with specific status codes', () => {
      const customError: any = new Error('Payment Required');
      customError.statusCode = 402;

      errorHandler(customError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('[Error]: Payment Required');
      expect(mockStatus).toHaveBeenCalledWith(402);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Payment Required',
        })
      );
    });

    it('should include the error stack trace ONLY if NODE_ENV is "development"', () => {
      const error = new Error('Dev only error');
      
      // Force environment to development
      process.env.NODE_ENV = 'development';
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Dev only error',
        stack: expect.any(String), // Stack trace should be present
      });

      mockJson.mockClear();
      process.env.NODE_ENV = 'production';
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJson).toHaveBeenCalledWith({
        message: 'Dev only error',
        stack: undefined, 
      });
    });

    it('should fallback to generic internal error message if error object lacks a message', () => {
      const weirdError: any = { weirdStuff: true };

      errorHandler(weirdError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(console.error).toHaveBeenCalledWith('[Error]: Unexpected Error');
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Internal Server Error',
        })
      );
    });
  });
});