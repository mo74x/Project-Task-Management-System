import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/projectController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createProjectSchema, updateProjectSchema } from '../utils/validators';

const router = Router();

//Apply authentication middleware to all routes
router.use(authenticate);

//routes
router.post('/', validate(createProjectSchema), createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', validate(updateProjectSchema), updateProject);
router.delete('/:id', deleteProject);

export default router;