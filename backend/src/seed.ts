import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { ProjectsService } from './projects/projects.service';
import { BoardsService } from './boards/boards.service';
import { TasksService } from './tasks/tasks.service';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const usersService = app.get(UsersService);
  const projectsService = app.get(ProjectsService);
  const boardsService = app.get(BoardsService);
  const tasksService = app.get(TasksService);

  console.log('Seeding data...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  let user = await usersService.findByEmail('demo@example.com');
  if (!user) {
    user = await usersService.create({
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
      role: 'admin',
    });
    console.log('Created Demo User');
  } else {
    console.log('Demo User already exists');
  }

  // Create project
  const projects = await projectsService.findAll(user.id);
  let project;
  if (projects.length === 0) {
    project = await projectsService.create(user.id, {
      name: 'Frontend Kanban App',
      description: 'The next generation project management app',
    });
    console.log('Created Project');
  } else {
    project = projects[0];
  }

  // Create board
  const boards = await boardsService.findAllByProject(project.id, user.id);
  let board;
  if (boards.length === 0) {
    board = await boardsService.create(user.id, {
      name: 'Sprint 1',
      projectId: project.id,
    });
    console.log('Created Board');

    // Create columns
    const todoCol = await boardsService.createColumn(user.id, { name: 'To Do', boardId: board.id });
    const inProgCol = await boardsService.createColumn(user.id, { name: 'In Progress', boardId: board.id });
    const doneCol = await boardsService.createColumn(user.id, { name: 'Done', boardId: board.id });

    // Create tasks
    await tasksService.create(user.id, { title: 'Design Database Schema', columnId: todoCol.id, assignedUserId: user.id });
    await tasksService.create(user.id, { title: 'Setup NestJS Backend', columnId: inProgCol.id, assignedUserId: user.id });
    await tasksService.create(user.id, { title: 'Implement JWT Auth', columnId: doneCol.id, assignedUserId: user.id });
    console.log('Created Columns and Tasks');
  } else {
    console.log('Board already exists');
  }

  console.log('Seeding complete!');
  await app.close();
}

bootstrap();
