import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'My Awesome Project' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'A highly productive kanban board', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
