import { AppDataSource } from '../config/database';

jest.mock('../config/database', () => {
  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
  };
  return {
    AppDataSource: {
      getRepository: jest.fn(() => mockRepo),
    },
  };
});

import {
  createProject,
  getProjectsByUser,
  getProjectById,
  updateProject,
  deleteProject,
  getAllProjects,
} from './projectService';

const mockProjectRepository = AppDataSource.getRepository(null as any) as jest.Mocked<any>;

describe('Project Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create and save a new project', async () => {
      const input = { title: 'Project 1', description: 'Test', status: 'Active' };
      const createdObj = { id: 'p-1', ...input, user: { id: 'u-1' } };

      mockProjectRepository.create.mockReturnValue(createdObj);
      mockProjectRepository.save.mockResolvedValue(createdObj);

      const result = await createProject(input, 'u-1');

      expect(mockProjectRepository.create).toHaveBeenCalledWith({
        title: 'Project 1',
        description: 'Test',
        status: 'Active',
        user: { id: 'u-1' },
      });
      expect(mockProjectRepository.save).toHaveBeenCalledWith(createdObj);
      expect(result).toEqual(createdObj);
    });
  });

  describe('getProjectsByUser', () => {
    it('should return paginated projects for a user', async () => {
      const projects = [{ id: 'p-1', title: 'P1' }, { id: 'p-2', title: 'P2' }];
      mockProjectRepository.findAndCount.mockResolvedValue([projects, 2]);

      const result = await getProjectsByUser('u-1', { page: 1, limit: 10, sortBy: 'title', order: 'ASC' });

      expect(mockProjectRepository.findAndCount).toHaveBeenCalledWith({
        where: { user: { id: 'u-1' } },
        order: { title: 'ASC' },
        skip: 0,
        take: 10,
      });

      expect(result.data).toEqual(projects);
      expect(result.meta).toEqual({
        totalItems: 2,
        itemCount: 2,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      });
    });
  });

  describe('getProjectById', () => {
    it('should return a project if found and user has access', async () => {
      const project = { id: 'p-1', title: 'P1', user: { id: 'u-1' } };
      mockProjectRepository.findOne.mockResolvedValue(project);

      const result = await getProjectById('p-1', 'u-1');

      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'p-1', user: { id: 'u-1' } },
        relations: { tasks: true },
      });
      expect(result).toEqual(project);
    });

    it('should throw a 404 if project is not found', async () => {
      mockProjectRepository.findOne.mockResolvedValue(null);

      await expect(getProjectById('p-1', 'u-1')).rejects.toThrow(
        'Project not found or access denied'
      );
    });
  });

  describe('updateProject', () => {
    it('should find, merge and save the updated project', async () => {
      const existing = { id: 'p-1', title: 'Old Title', user: { id: 'u-1' } };
      const updated = { id: 'p-1', title: 'New Title', user: { id: 'u-1' } };

      mockProjectRepository.findOne.mockResolvedValue(existing);
      mockProjectRepository.save.mockResolvedValue(updated);

      const result = await updateProject('p-1', 'u-1', { title: 'New Title' });

      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'p-1', user: { id: 'u-1' } },
      });
      expect(mockProjectRepository.merge).toHaveBeenCalledWith(existing, {
        title: 'New Title',
        description: undefined,
        status: undefined,
      });
      expect(mockProjectRepository.save).toHaveBeenCalledWith(existing);
      expect(result).toEqual(updated);
    });

    it('should throw 404 if project to update is not found', async () => {
      mockProjectRepository.findOne.mockResolvedValue(null);

      await expect(updateProject('p-1', 'u-1', { title: 'New' })).rejects.toThrow(
        'Project not found or access denied'
      );
    });
  });

  describe('deleteProject', () => {
    it('should find and remove the project', async () => {
      const existing = { id: 'p-1', title: 'P1', user: { id: 'u-1' } };
      mockProjectRepository.findOne.mockResolvedValue(existing);
      mockProjectRepository.remove.mockResolvedValue(existing);

      await deleteProject('p-1', 'u-1');

      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'p-1', user: { id: 'u-1' } },
      });
      expect(mockProjectRepository.remove).toHaveBeenCalledWith(existing);
    });

    it('should throw 404 if project to delete is not found', async () => {
      mockProjectRepository.findOne.mockResolvedValue(null);

      await expect(deleteProject('p-1', 'u-1')).rejects.toThrow(
        'Project not found or access denied'
      );
    });
  });

  describe('getAllProjects', () => {
    it('should return all projects across all users', async () => {
      const allList = [{ id: 'p-1' }, { id: 'p-2' }];
      mockProjectRepository.find.mockResolvedValue(allList);

      const result = await getAllProjects();

      expect(mockProjectRepository.find).toHaveBeenCalledWith({
        relations: { user: true },
      });
      expect(result).toEqual(allList);
    });
  });
});
