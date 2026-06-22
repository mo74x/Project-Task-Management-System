import { Request,Response } from "express";
import { AppDataSource } from '../config/database';
import { Task } from '../models/Task';
import { Project } from '../models/Project';

const taskRepository = AppDataSource.getRepository(Task);
const projectRepository = AppDataSource.getRepository(Project);

//verify project ownership
const verifyProjectAccess = async (projectId: string, userId: string) => {
  return await projectRepository.findOne({ where: { id: projectId, user: { id: userId } } });
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.projectId as string;
    const userId = (req.user as any).id as string;

    const project = await verifyProjectAccess(projectId, userId);
    if (!project) {
      res.status(404).json({ message: 'Project not found or access denied' });
      return;
    }

    const newTask = taskRepository.create({
      ...req.body,
      project: { id: projectId }
    });

    await taskRepository.save(newTask);
    res.status(201).json({ message: 'Task created', task: newTask });
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error });
  }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.projectId as string;
    const { status, priority } = req.query as { status?: string, priority?: string };
    const userId = (req.user as any).id as string;

    const project = await verifyProjectAccess(projectId, userId);
    if (!project) {
      res.status(404).json({ message: 'Project not found or access denied' });
      return;
    }

    //dynamic where clause for filtering
    const whereClause: any = { project: { id: projectId } };
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;

    const tasks = await taskRepository.find({
      where: whereClause,
      order: { createdAt: 'DESC' }
    });

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.projectId as string;
    const taskId = req.params.taskId as string;
    const userId = (req.user as any).id as string;

    const project = await verifyProjectAccess(projectId, userId);
    if (!project) {
      res.status(404).json({ message: 'Project not found or access denied' });
      return;
    }

    const task = await taskRepository.findOne({ where: { id: taskId, project: { id: projectId } } });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    taskRepository.merge(task, req.body);
    const updatedTask = await taskRepository.save(task);

    res.status(200).json({ message: 'Task updated', task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.projectId as string;
    const taskId = req.params.taskId as string;
    const userId = (req.user as any).id as string;

    const project = await verifyProjectAccess(projectId, userId);
    if (!project) {
      res.status(404).json({ message: 'Project not found or access denied' });
      return;
    }

    const task = await taskRepository.findOne({ where: { id: taskId, project: { id: projectId } } });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    await taskRepository.remove(task);
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error });
  }
};