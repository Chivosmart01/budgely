import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Chivo Smart', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'NGN', required: false })
  @IsOptional()
  @IsString()
  currency?: string;
}
