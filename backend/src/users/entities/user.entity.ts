import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { ProjectMember } from '../../projects/entities/project-member.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Comment } from '../../tasks/entities/comment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Don't return password by default
  password: string;

  @Column()
  name: string;

  @Column({ default: 'member' })
  role: string; // 'admin' or 'member'

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Project, (project) => project.owner)
  ownedProjects: Project[];

  @OneToMany(() => ProjectMember, (member) => member.user)
  projectMemberships: ProjectMember[];

  @OneToMany(() => Task, (task) => task.assignedUser)
  assignedTasks: Task[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
