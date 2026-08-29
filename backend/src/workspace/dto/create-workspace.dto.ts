import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString({ message: 'Workspace name must be a string.' })
  @IsNotEmpty({ message: 'Workspace name is required.' })
  @MinLength(3, { message: 'Workspace name must be at least 3 characters long.' })
  name!: string;
}
