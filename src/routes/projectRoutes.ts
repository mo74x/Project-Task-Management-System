import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/projectController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/role';
import { validate } from '../middlewares/validate';
import { createProjectSchema, updateProjectSchema } from '../utils/validators';
import taskRoutes from './taskRoutes';
import { UserRole } from '../models/User';

const router = Router();

//Apply authentication middleware to all routes
router.use(authenticate);

//Nested task routes
router.use('/:projectId/tasks', taskRoutes);

//routes
router.post('/', validate(createProjectSchema), createProject);
router.get('/', getProjects);
router.get(
  '/admin/all', 
  authorize([UserRole.ADMIN]), 
  async (req, res) => {
    //inline controller for admin demonstration
    const { AppDataSource } = await import('../config/database');
    const { Project } = await import('../models/Project');
    
    const allProjects = await AppDataSource.getRepository(Project).find({
      relations: { user: true } // Show which user owns which project
    });
    res.status(200).json({ projects: allProjects });
  }
);
router.get('/:id', getProjectById);
router.put('/:id', validate(updateProjectSchema), updateProject);
router.delete('/:id', deleteProject);

export default router;