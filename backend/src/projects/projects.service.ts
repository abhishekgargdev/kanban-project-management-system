import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private membersRepository: Repository<ProjectMember>,
  ) {}

  async create(userId: string, createProjectDto: CreateProjectDto) {
    const project = this.projectsRepository.create({
      ...createProjectDto,
      ownerId: userId,
    });
    const savedProject = await this.projectsRepository.save(project);

    // Also add the owner as an admin member
    const member = this.membersRepository.create({
      projectId: savedProject.id,
      userId: userId,
      role: 'admin',
    });
    await this.membersRepository.save(member);

    return savedProject;
  }

  async findAll(userId: string) {
    return this.projectsRepository
      .createQueryBuilder('project')
      .leftJoin('project.members', 'member')
      .where('project.ownerId = :userId OR member.userId = :userId', { userId })
      .getMany();
  }

  async findOne(id: string, userId: string) {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['members'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const isMemberOrOwner = project.ownerId === userId || project.members.some(m => m.userId === userId);
    if (!isMemberOrOwner) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async update(id: string, userId: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.findOne(id, userId);
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can update the project details');
    }
    
    Object.assign(project, updateProjectDto);
    return this.projectsRepository.save(project);
  }

  async remove(id: string, userId: string) {
    const project = await this.findOne(id, userId);
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete the project');
    }

    await this.projectsRepository.remove(project);
    return { message: 'Project deleted successfully' };
  }
}
