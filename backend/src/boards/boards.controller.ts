import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('boards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new board' })
  create(@Request() req, @Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(req.user.id, createBoardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all boards for a project' })
  @ApiQuery({ name: 'projectId', required: true })
  findAll(@Request() req, @Query('projectId') projectId: string) {
    return this.boardsService.findAllByProject(projectId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single board' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.boardsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a board' })
  update(@Request() req, @Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardsService.update(id, req.user.id, updateBoardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a board' })
  remove(@Request() req, @Param('id') id: string) {
    return this.boardsService.remove(id, req.user.id);
  }

  @Post('columns')
  @ApiOperation({ summary: 'Create a column in a board' })
  createColumn(@Request() req, @Body() createColumnDto: CreateColumnDto) {
    return this.boardsService.createColumn(req.user.id, createColumnDto);
  }
}
