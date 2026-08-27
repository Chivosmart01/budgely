import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { TrackingType } from '@prisma/client';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Food & Dining' })
  @IsNotEmpty({ message: 'Category name is required' })
  @IsString()
  name: string;

  @ApiProperty({ example: 35000, description: 'Monthly budget allocation for this category' })
  @IsNotEmpty({ message: 'Allocated amount is required' })
  @IsNumber()
  @Min(0, { message: 'Allocated amount cannot be negative' })
  allocatedAmount: number;

  @ApiProperty({ enum: TrackingType, default: TrackingType.DAILY, required: false })
  @IsOptional()
  @IsEnum(TrackingType)
  trackingType?: TrackingType;

  @ApiProperty({ example: false, required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isSavings?: boolean;

  @ApiProperty({ example: 'Restaurant', required: false, default: 'Receipt' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: '#F59E0B', required: false, default: '#10B981' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 'Groceries, restaurants, snacks', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Food & Dining', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 40000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  allocatedAmount?: number;

  @ApiProperty({ enum: TrackingType, required: false })
  @IsOptional()
  @IsEnum(TrackingType)
  trackingType?: TrackingType;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isSavings?: boolean;

  @ApiProperty({ example: 'Restaurant', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: '#F59E0B', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 'Updated notes', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
