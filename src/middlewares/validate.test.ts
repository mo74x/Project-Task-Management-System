import { Request, Response, NextFunction } from 'express';
import { validate } from './validate';
import { z } from 'zod';

describe('Validation Middleware (validate)', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  //simple Zod schema for testing
  const testSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    age: z.number({ message: 'Age is required' }).int('Age must be an integer'),
  });

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockNext = jest.fn();

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  it('should call next() without arguments if validation passes', async () => {
    // Provide a perfectly valid body
    mockRequest.body = { username: 'Developer', age: 25 };

    // Initialize the middleware with our test schema
    const middleware = validate(testSchema);

    // Execute the middleware
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(); // Called with no arguments
    expect(mockStatus).not.toHaveBeenCalled();
  });

  it('should return 400 and beautifully formatted errors if Zod validation fails', async () => {
    // Provide invalid data
    mockRequest.body = { username: 'yo' }; 

    const middleware = validate(testSchema);

    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Validation failed',
      errors: [
        { field: 'username', message: 'Username must be at least 3 characters' },
        { field: 'age', message: 'Age is required' },
      ],
    });
    
    // Ensure it prevented the request from continuing
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should pass non-Zod errors directly to the global error handler via next(error)', async () => {

    const explosiveSchema = {
      parseAsync: jest.fn().mockRejectedValue(new Error('Something catastrophic happened')),
    } as any;

    const middleware = validate(explosiveSchema);

    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    // Verify that instead of returning a 400
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect(mockStatus).not.toHaveBeenCalled();
  });
});