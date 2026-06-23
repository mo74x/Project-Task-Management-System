import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';
import { Project } from '../models/Project';
import { Task, TaskPriority, TaskStatus } from '../models/Task';
import { hashPassword } from '../utils/auth';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    
    const userRepository = AppDataSource.getRepository(User);
    const projectRepository = AppDataSource.getRepository(Project);
    const taskRepository = AppDataSource.getRepository(Task);

    console.log('Clearing existing data...');
    // Clear in correct relational order to avoid foreign key constraints
    await taskRepository.createQueryBuilder().delete().execute();
    await projectRepository.createQueryBuilder().delete().execute();
    await userRepository.createQueryBuilder().delete().execute();

    console.log('Seeding users...');
    const adminPassword = await hashPassword('admin123');
    const memberPassword = await hashPassword('member123');

    const admin = userRepository.create({
      name: 'Admin User',
      email: 'admin@electropi.com',
      password: adminPassword,
      role: UserRole.ADMIN,
    });

    const member = userRepository.create({
      name: 'Member User',
      email: 'member@electropi.com',
      password: memberPassword,
      role: UserRole.MEMBER,
    });

    await userRepository.save([admin, member]);

    console.log('Seeding projects and tasks...');
    const project = projectRepository.create({
      title: 'Electro Pi API Migration',
      description: 'Upgrade legacy API to Node.js and TypeScript',
      status: 'Active',
      user: member, // Assign to the member
    });

    await projectRepository.save(project);

    const task1 = taskRepository.create({
      title: 'Setup Database',
      description: 'Configure TypeORM and PostgreSQL',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      project: project,
    });

    const task2 = taskRepository.create({
      title: 'Write Documentation',
      description: 'Create Swagger JSON file',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      project: project,
    });

    await taskRepository.save([task1, task2]);

    console.log('Database seeded successfully!');
    console.log('Test Accounts:');
    console.log('Admin  -> email: admin@electropi.com  | password: admin123');
    console.log('Member -> email: member@electropi.com | password: member123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();