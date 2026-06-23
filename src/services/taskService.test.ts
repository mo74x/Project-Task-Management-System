import { AppDataSource } from '../config/database';
import { Task, TaskStatus, TaskPriority } from '../models/Task';
import { Project } from '../models/Project';

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
      getRepository: jest.fn((entity) => {
        if (entity && (entity.name === 'Project' || entity.name === 'ProjectEntity')) {
          return mockProjectRepo;
        }
        return mockTaskRepo;
      }),
    },
  };
});

import {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
} from './taskService';

const mockTaskRepository = AppDataSource.getRepository(Task) as jest.Mocked<any>;
const mockProjectRepository = AppDataSource.getRepository(Project) as jest.Mocked<any>;

describe('Task Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyProjectAccess (internal verification)', () => {
    it('should throw 404 if project access is denied or not found', async () => {
      mockProjectRepository.findOne.mockResolvedValue(null);

      await expect(getTaskById('p-1', 'u-1', 't-1')).rejects.toThrow(
        'Project not found or access denied'
      );
      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'p-1', user: { id: 'u-1' } },
      });
    });
  });

  describe('createTask', () => {
    it('should create and save a nested task if project access is verified', async () => {
      mockProjectRepository.findOne.mockResolvedValue({ id: 'p-1' });
      const taskInput = {
        title: 'New Task',
        description: 'Task Desc',
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
      };
      const createdObj = { id: 't-1', ...taskInput, project: { id: 'p-1' } };

      mockTaskRepository.create.mockReturnValue(createdObj);
      mockTaskRepository.save.mockResolvedValue(createdObj);

      const result = await createTask('p-1', 'u-1', taskInput);

      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'p-1', user: { id: 'u-1' } },
      });
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        ...taskInput,
        project: { id: 'p-1' },
      });
      expect(mockTaskRepository.save).toHaveBeenCalledWith(createdObj);
      expect(result).toEqual(createdObj);
    });
  });

  describe('getTasksByProject', () => {
    it('should return paginated and filtered tasks', async () => {
      mockProjectRepository.findOne.mockResolvedValue({ id: 'p-1' });
      const tasks = [{ id: 't-1', title: 'T1' }];
      mockTaskRepository.findAndCount.mockResolvedValue([tasks, 1]);

      const result = await getTasksByProject('p-1', 'u-1', {
        page: 1,
        limit: 5,
        status: 'Pending',
        priority: 'Medium',
      });

      expect(mockTaskRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          project: { id: 'p-1' },
          status: 'Pending',
          priority: 'Medium',
        },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 5,
      });

      expect(result.data).toEqual(tasks);
      expect(result.meta).toEqual({
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 5,
        totalPages: 1,
        currentPage: 1,
      });
    });
  });

  describe('getTaskById', () => {
    it('should return a task if found', async () => {
      mockProjectRepository.findOne.mockResolvedValue({ id: 'p-1' });
      const task = { id: 't-1', title: 'T1' };
      mockTaskRepository.findOne.mockResolvedValue(task);

      const result = await getTaskById('p-1', 'u-1', 't-1');

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 't-1', project: { id: 'p-1' } },
      });
      expect(result).toEqual(task);
    });

    it('should throw 404 if task is not found', async () => {
      mockProjectRepository.findOne.mockResolvedValue({ id: 'p-1' });
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(getTaskById('p-1', 'u-1', 't-1')).rejects.toThrow(
        'Task not found'
      );
    });
  });

  describe('updateTask', () => {
    it('should update and save the modified task', async () => {
      mockProjectRepository.findOne.mockResolvedValue({ id: 'p-1' });
      const existing = { id: 't-1', title: 'Old Title' };
      const updated = { id: 't-1', title: 'New Title' };

      mockTaskRepository.findOne.mockResolvedValue(existing);
      mockTaskRepository.save.mockResolvedValue(updated);

      const result = await updateTask('p-1', 'u-1', 't-1', { title: 'New Title' });

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 't-1', project: { id: 'p-1' } },
      });
      expect(mockTaskRepository.merge).toHaveBeenCalledWith(existing, {
        title: 'New Title',
        description: undefined,
        status: undefined,
        priority: undefined,
        dueDate: undefined,
      });
      expect(mockTaskRepository.save).toHaveBeenCalledWith(existing);
      expect(result).toEqual(updated);
    });

    it('should throw 404 if task to update is not found', async () => {
      mockProjectRepository.findOne.mockResolvedValue({ id: 'p-1' });
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(
        updateTask('p-1', 'u-1', 't-1', { title: 'New' })
      ).rejects.toThrow('Task not found');
    });
  });

  describe('deleteTask', () => {
    it('should find and remove the task', async () => {
      mockProjectRepository.findOne.mockResolvedValue({ id: 'p-1' });
      const task = { id: 't-1', title: 'T1' };
      mockTaskRepository.findOne.mockResolvedValue(task);
      mockTaskRepository.remove.mockResolvedValue(task);

      await deleteTask('p-1', 'u-1', 't-1');

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 't-1', project: { id: 'p-1' } },
      });
      expect(mockTaskRepository.remove).toHaveBeenCalledWith(task);
    });

    it('should throw 404 if task to delete is not found', async () => {
      mockProjectRepository.findOne.mockResolvedValue({ id: 'p-1' });
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(deleteTask('p-1', 'u-1', 't-1')).rejects.toThrow(
        'Task not found'
      );
    });
  });
});
