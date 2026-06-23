import { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/projectService';

export const createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const project = await projectService.createProject(req.body, userId);

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const page = parseInt(req.query.page as string) || undefined;
    const limit = parseInt(req.query.limit as string) || undefined;
    const sortBy = req.query.sortBy as string | undefined;
    const order = (req.query.order as string)?.toUpperCase() === 'ASC' ? 'ASC' as const : 'DESC' as const;

    const result = await projectService.getProjectsByUser(userId, { page, limit, sortBy, order });

    res.status(200).json({ projects: result.data, meta: result.meta });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const project = await projectService.getProjectById(req.params.id as string, userId);

    res.status(200).json({ project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const project = await projectService.updateProject(req.params.id as string, userId, req.body);

    res.status(200).json({ message: 'Project updated', project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    await projectService.deleteProject(req.params.id as string, userId);

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projects = await projectService.getAllProjects();

    res.status(200).json({ projects });
  } catch (error) {
    next(error);
  }
};