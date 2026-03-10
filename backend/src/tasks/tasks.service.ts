import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { Comment } from './entities/comment.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { BoardsService } from '../boards/boards.service';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private boardsService: BoardsService,
  ) {}

  async create(userId: string, createTaskDto: CreateTaskDto) {
    // In a real app we'd verify the user has access to the column/board
    // For brevity, we trust the columnId is valid given client flow, or we'd fetch the column.
    
    const count = await this.tasksRepository.count({ where: { columnId: createTaskDto.columnId }});
    const task = this.tasksRepository.create({
      ...createTaskDto,
      order: count,
    });
    return this.tasksRepository.save(task);
  }

  async findOne(id: string) {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignedUser', 'comments', 'comments.user'],
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id);
    Object.assign(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  async remove(id: string) {
    const task = await this.findOne(id);
    return this.tasksRepository.remove(task);
  }

  async createComment(userId: string, createCommentDto: CreateCommentDto) {
    await this.findOne(createCommentDto.taskId);
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      userId,
    });
    return this.commentsRepository.save(comment);
  }
}
