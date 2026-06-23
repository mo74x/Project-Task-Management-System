import { Request, Response, NextFunction } from 'express';
import { authorize } from './role';

describe('Role Middleware (authorize)', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockNext = jest.fn();

    // Start with an empty user object
    mockRequest = {
      user: undefined,
    } as any;

    mockResponse = {
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  it('should return 403 if the user has no role defined', () => {
    const adminOnlyMiddleware = authorize(['Admin']);
    
    // Simulate an authenticated user, but their token lacked a role
    (mockRequest as any).user = { id: 'uuid-123' }; 

    adminOnlyMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Forbidden: You do not have the required permissions to perform this action.',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 if the user role is not in the allowed list', () => {
    const adminOnlyMiddleware = authorize(['Admin']);
    
    // member but route requires Admin
    (mockRequest as any).user = { id: 'uuid-123', role: 'Member' };

    adminOnlyMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next() if the user role matches the required roles', () => {
    // route allows Admin or SuperAdmin
    const adminMiddleware = authorize(['Admin', 'SuperAdmin']);
    
    // user is Admin
    (mockRequest as any).user = { id: 'uuid-123', role: 'Admin' };

    adminMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockStatus).not.toHaveBeenCalled();
  });
});