import { Router } from 'express';
import { createTask, getTasks, updateTask, deleteTask } from '../controllers/taskController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createTaskSchema, updateTaskSchema } from '../utils/validators';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', validate(createTaskSchema), createTask);
router.get('/', getTasks);
router.put('/:taskId', validate(updateTaskSchema), updateTask);
router.delete('/:taskId', deleteTask);

export default router;