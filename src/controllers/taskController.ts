import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/taskService';

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.params.id as string;
    const userId = (req.user as any).id;
    const task = await taskService.createTask(projectId, userId, req.body);

    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.params.id as string;
    const userId = (req.user as any).id;

    const page = parseInt(req.query.page as string) || undefined;
    const limit = parseInt(req.query.limit as string) || undefined;
    const sortBy = req.query.sortBy as string | undefined;
    const order = (req.query.order as string)?.toUpperCase() === 'ASC' ? 'ASC' as const : 'DESC' as const;
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;

    const result = await taskService.getTasksByProject(projectId, userId, {
      page, limit, sortBy, order, status, priority,
    });

    res.status(200).json({ tasks: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.params.id as string;
    const userId = (req.user as any).id;
    const taskId = req.params.taskId as string;
    const task = await taskService.getTaskById(projectId, userId, taskId);

    res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.params.id as string;
    const userId = (req.user as any).id;
    const taskId = req.params.taskId as string;
    const task = await taskService.updateTask(projectId, userId, taskId, req.body);

    res.status(200).json({ message: 'Task updated', task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.params.id as string;
    const userId = (req.user as any).id;
    const taskId = req.params.taskId as string;
    await taskService.deleteTask(projectId, userId, taskId);

    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};