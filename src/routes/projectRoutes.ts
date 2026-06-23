import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getAllProjects
} from '../controllers/projectController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/role';
import { validate } from '../middlewares/validate';
import { createProjectSchema, updateProjectSchema } from '../utils/validators';
import taskRoutes from './taskRoutes';
import { UserRole } from '../models/User';

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.post('/', validate(createProjectSchema), createProject);
router.get('/', getProjects);
router.get('/admin/all', authorize([UserRole.ADMIN]), getAllProjects);
router.get('/:id', getProjectById);
router.put('/:id', validate(updateProjectSchema), updateProject);
router.delete('/:id', deleteProject);

// Mount task routes under projects
router.use('/:id/tasks', taskRoutes);

export default router;