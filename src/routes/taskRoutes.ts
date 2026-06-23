import { Router } from 'express';
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from '../controllers/taskController';
import { validate } from '../middlewares/validate';
import { createTaskSchema, updateTaskSchema } from '../utils/validators';

// mergeParams is required to access :id from the parent router (projectRoutes)
const router = Router({ mergeParams: true });

router.post('/', validate(createTaskSchema), createTask);
router.get('/', getTasks);
router.get('/:taskId', getTaskById);
router.put('/:taskId', validate(updateTaskSchema), updateTask);
router.delete('/:taskId', deleteTask);

export default router;