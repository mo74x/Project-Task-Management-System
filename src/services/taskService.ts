import { AppDataSource } from '../config/database';
import { Task, TaskStatus, TaskPriority } from '../models/Task';
import { Project } from '../models/Project';

const taskRepository = AppDataSource.getRepository(Task);
const projectRepository = AppDataSource.getRepository(Project);

interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

interface TaskQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  status?: string;
  priority?: string;
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

// Verify project ownership before any task operation
const verifyProjectAccess = async (projectId: string, userId: string): Promise<Project> => {
  const project = await projectRepository.findOne({
    where: { id: projectId, user: { id: userId } },
  });

  if (!project) {
    const error: any = new Error('Project not found or access denied');
    error.statusCode = 404;
    throw error;
  }

  return project;
};

export const createTask = async (projectId: string, userId: string, data: CreateTaskInput): Promise<Task> => {
  await verifyProjectAccess(projectId, userId);

  const { title, description, status, priority, dueDate } = data;
  const newTask = taskRepository.create({
    title,
    description,
    status,
    priority,
    dueDate,
    project: { id: projectId },
  });

  await taskRepository.save(newTask);
  return newTask;
};

export const getTasksByProject = async (projectId: string, userId: string, query: TaskQuery): Promise<PaginatedResult<Task>> => {
  await verifyProjectAccess(projectId, userId);

  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || 'createdAt';
  const order = query.order || 'DESC';

  // Dynamic where clause for filtering
  const whereClause: any = { project: { id: projectId } };
  if (query.status) whereClause.status = query.status;
  if (query.priority) whereClause.priority = query.priority;

  const [tasks, total] = await taskRepository.findAndCount({
    where: whereClause,
    order: { [sortBy]: order },
    skip,
    take: limit,
  });

  return {
    data: tasks,
    meta: {
      totalItems: total,
      itemCount: tasks.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    },
  };
};

export const getTaskById = async (projectId: string, userId: string, taskId: string): Promise<Task> => {
  await verifyProjectAccess(projectId, userId);

  const task = await taskRepository.findOne({
    where: { id: taskId, project: { id: projectId } },
  });

  if (!task) {
    const error: any = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  return task;
};

export const updateTask = async (projectId: string, userId: string, taskId: string, data: Partial<CreateTaskInput>): Promise<Task> => {
  await verifyProjectAccess(projectId, userId);

  const task = await taskRepository.findOne({
    where: { id: taskId, project: { id: projectId } },
  });

  if (!task) {
    const error: any = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  // Only merge allowed fields
  taskRepository.merge(task, {
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate,
  });
  const updatedTask = await taskRepository.save(task);

  return updatedTask;
};

export const deleteTask = async (projectId: string, userId: string, taskId: string): Promise<void> => {
  await verifyProjectAccess(projectId, userId);

  const task = await taskRepository.findOne({
    where: { id: taskId, project: { id: projectId } },
  });

  if (!task) {
    const error: any = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  await taskRepository.remove(task);
};
