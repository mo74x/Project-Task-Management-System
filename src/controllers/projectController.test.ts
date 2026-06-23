import { Request, Response, NextFunction } from 'express';
import { createProject, getProjects, getProjectById, updateProject, deleteProject } from './projectController';
import * as projectService from '../services/projectService';

// Mock the service layer
jest.mock('../services/projectService');

describe('Project Controller', () => {
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

      const newProject = { id: 'proj-1', title: 'New API', description: 'Test project', status: 'Active' };
      (projectService.createProject as jest.Mock).mockResolvedValue(newProject);

      await createProject(mockRequest as Request, mockResponse as Response, mockNext);

      expect(projectService.createProject).toHaveBeenCalledWith(mockRequest.body, 'user-123');
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Project created successfully',
        project: newProject,
      });
    });
  });

  describe('getProjects (Pagination)', () => {
    it('should return paginated projects for the authenticated user', async () => {
      mockRequest.query = { page: '2', limit: '5' };

      const mockResult = {
        data: [{ id: 'proj-1', title: 'P1' }, { id: 'proj-2', title: 'P2' }],
        meta: {
          totalItems: 12,
          itemCount: 2,
          itemsPerPage: 5,
          totalPages: 3,
          currentPage: 2,
        },
      };

      (projectService.getProjectsByUser as jest.Mock).mockResolvedValue(mockResult);

      await getProjects(mockRequest as Request, mockResponse as Response, mockNext);

      expect(projectService.getProjectsByUser).toHaveBeenCalledWith('user-123', expect.objectContaining({
        page: 2,
        limit: 5,
      }));
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        projects: mockResult.data,
        meta: mockResult.meta,
      });
    });
  });

  describe('getProjectById', () => {
    it('should call next(error) when service throws 404', async () => {
      mockRequest.params = { id: 'unknown-proj' };

      const error: any = new Error('Project not found or access denied');
      error.statusCode = 404;
      (projectService.getProjectById as jest.Mock).mockRejectedValue(error);

      await getProjectById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should return the project if found', async () => {
      mockRequest.params = { id: 'valid-proj' };
      const foundProject = { id: 'valid-proj', title: 'Valid' };

      (projectService.getProjectById as jest.Mock).mockResolvedValue(foundProject);

      await getProjectById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ project: foundProject });
    });
  });

  describe('updateProject', () => {
    it('should update and return the project', async () => {
      mockRequest.params = { id: 'proj-1' };
      mockRequest.body = { title: 'Updated Title' };

      const updatedProject = { id: 'proj-1', title: 'Updated Title' };
      (projectService.updateProject as jest.Mock).mockResolvedValue(updatedProject);

      await updateProject(mockRequest as Request, mockResponse as Response, mockNext);

      expect(projectService.updateProject).toHaveBeenCalledWith('proj-1', 'user-123', mockRequest.body);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Project updated', project: updatedProject });
    });
  });

  describe('deleteProject', () => {
    it('should delete the project and return success message', async () => {
      mockRequest.params = { id: 'proj-1' };
      (projectService.deleteProject as jest.Mock).mockResolvedValue(undefined);

      await deleteProject(mockRequest as Request, mockResponse as Response, mockNext);

      expect(projectService.deleteProject).toHaveBeenCalledWith('proj-1', 'user-123');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Project deleted successfully' });
    });
  });
});