import { AppDataSource } from '../config/database';
import { Project } from '../models/Project';

const projectRepository = AppDataSource.getRepository(Project);

interface CreateProjectInput {
  title: string;
  description?: string;
  status?: string;
}

interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

interface PaginatedResult<T> {
  data: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export const createProject = async (data: CreateProjectInput, userId: string): Promise<Project> => {
  const newProject = projectRepository.create({
    title: data.title,
    description: data.description,
    status: data.status || 'Active',
    user: { id: userId },
  });

  await projectRepository.save(newProject);
  return newProject;
};

export const getProjectsByUser = async (userId: string, query: PaginationQuery): Promise<PaginatedResult<Project>> => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || 'createdAt';
  const order = query.order || 'DESC';

  const [projects, total] = await projectRepository.findAndCount({
    where: { user: { id: userId } },
    order: { [sortBy]: order },
    skip,
    take: limit,
  });

  return {
    data: projects,
    meta: {
      totalItems: total,
      itemCount: projects.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    },
  };
};

export const getProjectById = async (projectId: string, userId: string): Promise<Project> => {
  const project = await projectRepository.findOne({
    where: { id: projectId, user: { id: userId } },
    relations: { tasks: true },
  });

  if (!project) {
    const error: any = new Error('Project not found or access denied');
    error.statusCode = 404;
    throw error;
  }

  return project;
};

export const updateProject = async (projectId: string, userId: string, data: Partial<CreateProjectInput>): Promise<Project> => {
  const project = await projectRepository.findOne({
    where: { id: projectId, user: { id: userId } },
  });

  if (!project) {
    const error: any = new Error('Project not found or access denied');
    error.statusCode = 404;
    throw error;
  }

  // Only merge allowed fields
  const { title, description, status } = data;
  projectRepository.merge(project, { title, description, status });
  const updatedProject = await projectRepository.save(project);

  return updatedProject;
};

export const deleteProject = async (projectId: string, userId: string): Promise<void> => {
  const project = await projectRepository.findOne({
    where: { id: projectId, user: { id: userId } },
  });

  if (!project) {
    const error: any = new Error('Project not found or access denied');
    error.statusCode = 404;
    throw error;
  }

  await projectRepository.remove(project);
};

export const getAllProjects = async (): Promise<Project[]> => {
  return await projectRepository.find({ relations: { user: true } });
};
