import { Request, Response } from 'express';
import { createTask, getTasks, updateTask, deleteTask } from './taskController';
import { AppDataSource } from '../config/database';

jest.mock('../config/database', () => {
  const mockTaskRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  const mockProjectRepo = {
    findOne: jest.fn(),
  };

  return {
    AppDataSource: {
      getRepository: jest.fn((entity: any) => {
        if (entity === 'Task' || entity?.name === 'Task') return mockTaskRepo;
        if (entity === 'Project' || entity?.name === 'Project') return mockProjectRepo;
        return {};
      }),
    },
  };
});

let mockTaskRepo: any;
let mockProjectRepo: any;

describe('Task Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockTaskRepo = AppDataSource.getRepository('Task');
    mockProjectRepo = AppDataSource.getRepository('Project');
    
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {
      user: { id: 'user-123', role: 'Member' },
      body: {},
      params: { projectId: 'proj-123' },
      query: {},
    } as any;
    
    mockResponse = {
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should return 404 if the parent project does not exist or user lacks access', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await createTask(mockRequest as Request, mockResponse as Response);

      // Verify it checked for project ownership
      expect(mockProjectRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'proj-123', user: { id: 'user-123' } }
      });
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Project not found or access denied' });
    });

    it('should successfully create a task if project access is verified', async () => {
      mockProjectRepo.findOne.mockResolvedValue({ id: 'proj-123' }); // Project found
      mockRequest.body = { title: 'New Task', priority: 'High' };
      
      const newTask = { id: 'task-1', ...mockRequest.body, project: { id: 'proj-123' } };
      
      mockTaskRepo.create.mockReturnValue(newTask);
      mockTaskRepo.save.mockResolvedValue(newTask);

      await createTask(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Task created', task: newTask });
    });
  });

  describe('getTasks (With Filtering)', () => {
    it('should apply status and priority filters correctly to the database query', async () => {
      mockProjectRepo.findOne.mockResolvedValue({ id: 'proj-123' });
      
      // Simulate user passing query parameters for filtering
      mockRequest.query = { status: 'Pending', priority: 'High' };
      
      const mockTasks = [{ id: 'task-1', title: 'T1' }];
      mockTaskRepo.findAndCount.mockResolvedValue([mockTasks, 1]);

      await getTasks(mockRequest as Request, mockResponse as Response);

      // Verify the dynamic where clause was constructed correctly
      expect(mockTaskRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            project: { id: 'proj-123' },
            status: 'Pending',
            priority: 'High',
          },
          order: { createdAt: 'DESC' },
        })
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          tasks: mockTasks,
          meta: expect.objectContaining({
            totalItems: 1,
          }),
        })
      );
    });
  });



  describe('updateTask', () => {
    it('should return 404 if the task itself is not found inside the project', async () => {
      mockProjectRepo.findOne.mockResolvedValue({ id: 'proj-123' }); // Project exists
      mockRequest.params = { projectId: 'proj-123', taskId: 'unknown-task' };
      
      mockTaskRepo.findOne.mockResolvedValue(null); // Task does not exist

      await updateTask(mockRequest as Request, mockResponse as Response);

      expect(mockTaskRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'unknown-task', project: { id: 'proj-123' } }
      });
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Task not found' });
    });
  });

  describe('deleteTask', () => {
    it('should successfully delete a task', async () => {
      mockProjectRepo.findOne.mockResolvedValue({ id: 'proj-123' });
      mockRequest.params = { projectId: 'proj-123', taskId: 'valid-task' };
      
      const taskToDelete = { id: 'valid-task', title: 'To Delete' };
      mockTaskRepo.findOne.mockResolvedValue(taskToDelete);

      await deleteTask(mockRequest as Request, mockResponse as Response);

      expect(mockTaskRepo.remove).toHaveBeenCalledWith(taskToDelete);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Task deleted' });
    });
  });
});