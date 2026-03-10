import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { BoardColumn } from './entities/column.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { CreateColumnDto } from './dto/create-column.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardsRepository: Repository<Board>,
    @InjectRepository(BoardColumn)
    private columnsRepository: Repository<BoardColumn>,
    private projectsService: ProjectsService,
  ) {}

  async create(userId: string, createBoardDto: CreateBoardDto) {
    // Check if user has access to the project
    await this.projectsService.findOne(createBoardDto.projectId, userId);
    
    const board = this.boardsRepository.create(createBoardDto);
    return this.boardsRepository.save(board);
  }

  async findAllByProject(projectId: string, userId: string) {
    await this.projectsService.findOne(projectId, userId);
    return this.boardsRepository.find({
      where: { projectId },
      relations: ['columns'],
      order: {
        columns: {
          order: 'ASC',
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const board = await this.boardsRepository.findOne({
      where: { id },
      relations: ['columns'],
    });
    if (!board) throw new NotFoundException('Board not found');
    
    // Check access
    await this.projectsService.findOne(board.projectId, userId);
    return board;
  }

  async update(id: string, userId: string, updateBoardDto: UpdateBoardDto) {
    const board = await this.findOne(id, userId);
    Object.assign(board, updateBoardDto);
    return this.boardsRepository.save(board);
  }

  async remove(id: string, userId: string) {
    const board = await this.findOne(id, userId);
    return this.boardsRepository.remove(board);
  }

  async createColumn(userId: string, createColumnDto: CreateColumnDto) {
    const board = await this.findOne(createColumnDto.boardId, userId);
    const existingColumns = await this.columnsRepository.count({ where: { boardId: board.id } });
    
    const column = this.columnsRepository.create({
      ...createColumnDto,
      order: existingColumns,
    });
    return this.columnsRepository.save(column);
  }
}
