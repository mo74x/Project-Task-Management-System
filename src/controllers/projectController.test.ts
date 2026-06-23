import { Request, Response } from 'express';
import { createProject, getProjects, getProjectById } from './projectController';
import { AppDataSource } from '../config/database';

//mock typeorm database con and repo methods
jest.mock('../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      merge: jest.fn(),
      remove: jest.fn(),
    }),
  },
}));

describe('Project Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let projectRepo: any;

  beforeEach(() => {
    // reset mocks before each test
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    projectRepo = AppDataSource.getRepository('Project');
    
    // create base req and res objects
    mockRequest = {
      user: { id: 'user-123', role: 'Member' },
      body: {},
      params: {},
      query: {},
    } as any;
    
    mockResponse = {
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  describe('createProject', () => {
    it('should successfully create a project linked to the user', async () => {
      mockRequest.body = { title: 'New API', description: 'Test project' };
      
      const newProject = { id: 'proj-1', ...mockRequest.body, user: { id: 'user-123' } };
      
      projectRepo.create.mockReturnValue(newProject);
      projectRepo.save.mockResolvedValue(newProject);

      await createProject(mockRequest as Request, mockResponse as Response);

      expect(projectRepo.create).toHaveBeenCalledWith({
        title: 'New API',
        description: 'Test project',
        status: 'Active', // Default status
        user: { id: 'user-123' }
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Project created successfully',
        project: newProject
      });
    });
  });

  describe('getProjects (Pagination)', () => {
    it('should return paginated projects for the authenticated user', async () => {
      mockRequest.query = { page: '2', limit: '5' };
      
      const mockProjects = [{ id: 'proj-1', title: 'P1' }, { id: 'proj-2', title: 'P2' }];
      const totalItems = 12;

      // mock findAndCount returning [data, total]
      projectRepo.findAndCount.mockResolvedValue([mockProjects, totalItems]);

      await getProjects(mockRequest as Request, mockResponse as Response);

      // verify skip and take logic
      expect(projectRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user: { id: 'user-123' } },
          skip: 5, 
          take: 5,
        })
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        projects: mockProjects,
        meta: {
          totalItems: 12,
          itemCount: 2,
          itemsPerPage: 5,
          totalPages: 3, // Math.ceil(12 / 5)
          currentPage: 2,
        }
      });
    });
  });

  describe('getProjectById', () => {
    it('should return 404 if the project does not exist or user does not own it', async () => {
      mockRequest.params = { id: 'unknown-proj' };
      
      // simulate finding nothing
      projectRepo.findOne.mockResolvedValue(null);

      await getProjectById(mockRequest as Request, mockResponse as Response);

      expect(projectRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'unknown-proj', user: { id: 'user-123' } },
        relations: { tasks: true }
      });
      
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Project not found or access denied' });
    });

    it('should return the project if found', async () => {
      mockRequest.params = { id: 'valid-proj' };
      const foundProject = { id: 'valid-proj', title: 'Valid' };
      
      projectRepo.findOne.mockResolvedValue(foundProject);

      await getProjectById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ project: foundProject });
    });
  });
});