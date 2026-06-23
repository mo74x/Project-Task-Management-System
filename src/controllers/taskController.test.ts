import { Request, Response, NextFunction } from 'express';
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from './taskController';
import * as taskService from '../services/taskService';

// Mock the service layer
jest.mock('../services/taskService');

describe('Task Controller', () => {
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
      params: { id: 'proj-123' },
      query: {},
    } as any;

    mockResponse = {
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should call next(error) when service throws (project not found)', async () => {
      const error: any = new Error('Project not found or access denied');
      error.statusCode = 404;
      (taskService.createTask as jest.Mock).mockRejectedValue(error);

      await createTask(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should successfully create a task if project access is verified', async () => {
      mockRequest.body = { title: 'New Task', priority: 'High' };

      const newTask = { id: 'task-1', title: 'New Task', priority: 'High', project: { id: 'proj-123' } };
      (taskService.createTask as jest.Mock).mockResolvedValue(newTask);

      await createTask(mockRequest as Request, mockResponse as Response, mockNext);

      expect(taskService.createTask).toHaveBeenCalledWith('proj-123', 'user-123', mockRequest.body);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Task created', task: newTask });
    });
  });

  describe('getTasks (With Filtering)', () => {
    it('should pass filter params to the service and return paginated results', async () => {
      mockRequest.query = { status: 'Pending', priority: 'High' };

      const mockResult = {
        data: [{ id: 'task-1', title: 'T1' }],
        meta: { totalItems: 1, itemCount: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
      };
      (taskService.getTasksByProject as jest.Mock).mockResolvedValue(mockResult);

      await getTasks(mockRequest as Request, mockResponse as Response, mockNext);

      expect(taskService.getTasksByProject).toHaveBeenCalledWith(
        'proj-123',
        'user-123',
        expect.objectContaining({
          status: 'Pending',
          priority: 'High',
        })
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        tasks: mockResult.data,
        meta: mockResult.meta,
      });
    });
  });

  describe('getTaskById', () => {
    it('should return the task if found', async () => {
      mockRequest.params = { id: 'proj-123', taskId: 'task-1' };
      const foundTask = { id: 'task-1', title: 'Found Task' };

      (taskService.getTaskById as jest.Mock).mockResolvedValue(foundTask);

      await getTaskById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(taskService.getTaskById).toHaveBeenCalledWith('proj-123', 'user-123', 'task-1');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ task: foundTask });
    });

    it('should call next(error) if task not found', async () => {
      mockRequest.params = { id: 'proj-123', taskId: 'unknown-task' };
      const error: any = new Error('Task not found');
      error.statusCode = 404;

      (taskService.getTaskById as jest.Mock).mockRejectedValue(error);

      await getTaskById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateTask', () => {
    it('should call next(error) if the task is not found', async () => {
      mockRequest.params = { id: 'proj-123', taskId: 'unknown-task' };
      const error: any = new Error('Task not found');
      error.statusCode = 404;

      (taskService.updateTask as jest.Mock).mockRejectedValue(error);

      await updateTask(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should update and return the task', async () => {
      mockRequest.params = { id: 'proj-123', taskId: 'task-1' };
      mockRequest.body = { status: 'Done' };
      const updatedTask = { id: 'task-1', title: 'T1', status: 'Done' };

      (taskService.updateTask as jest.Mock).mockResolvedValue(updatedTask);

      await updateTask(mockRequest as Request, mockResponse as Response, mockNext);

      expect(taskService.updateTask).toHaveBeenCalledWith('proj-123', 'user-123', 'task-1', mockRequest.body);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Task updated', task: updatedTask });
    });
  });

  describe('deleteTask', () => {
    it('should successfully delete a task', async () => {
      mockRequest.params = { id: 'proj-123', taskId: 'valid-task' };
      (taskService.deleteTask as jest.Mock).mockResolvedValue(undefined);

      await deleteTask(mockRequest as Request, mockResponse as Response, mockNext);

      expect(taskService.deleteTask).toHaveBeenCalledWith('proj-123', 'user-123', 'valid-task');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Task deleted' });
    });
  });
});