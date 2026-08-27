import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class UpdateBudgetDto {
  @ApiProperty({ example: 120000, required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  totalIncome?: number;

  @ApiProperty({ example: 'Updated budget notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  allowOverAllocation?: boolean;
}
