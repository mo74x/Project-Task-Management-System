import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Project } from './Project';

export enum UserRole {
  ADMIN = 'Admin',
  MEMBER = 'Member'
}
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.MEMBER })
  role!: UserRole;

  // A User can have many Projects 
  @OneToMany(() => Project, (project) => project.user)
  projects!: Project[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}