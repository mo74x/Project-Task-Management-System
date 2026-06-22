import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Task } from './Task';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ default: 'Active' })
  status!: string;

  // Many Projects belong to one User
  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
  user!: User;

  // A Project can have many Tasks
  @OneToMany(() => Task, (task) => task.project, { cascade: true })
  tasks!: Task[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}