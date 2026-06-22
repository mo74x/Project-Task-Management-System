import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Project } from '../models/Project';

const projectRepository = AppDataSource.getRepository(Project);

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, status } = req.body;
    // @ts-ignore 
    const userId = req.user.id;

    const newProject = projectRepository.create({
      title,
      description,
      status: status || 'Active',
      user: { id: userId }
    });

    await projectRepository.save(newProject);
    res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error });
  }
};

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    // Fetch projects belonging only to auth user
    const projects = await projectRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' } //sorting
    });

    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.user.id;

    const project = await projectRepository.findOne({
      where: { id: id as string, user: { id: userId } },
      relations: { tasks: true } //fetch tasks related to the project
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found or access denied' });
      return;
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.user.id;

    const project = await projectRepository.findOne({ where: { id: id as string, user: { id: userId } } });

    if (!project) {
      res.status(404).json({ message: 'Project not found or access denied' });
      return;
    }

    // Merge new data into the existing project
    projectRepository.merge(project, req.body);
    const updatedProject = await projectRepository.save(project);

    res.status(200).json({ message: 'Project updated', project: updatedProject });
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.user.id;

    const project = await projectRepository.findOne({ where: { id: id as string, user: { id: userId } } });

    if (!project) {
      res.status(404).json({ message: 'Project not found or access denied' });
      return;
    }

    await projectRepository.remove(project);
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error });
  }
};