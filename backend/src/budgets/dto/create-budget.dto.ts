import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TrackingType } from '@prisma/client';

export class CreateBudgetCategoryItemDto {
  @ApiProperty({ example: 'Daily Expenses' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 30000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  allocatedAmount: number;

  @ApiProperty({ enum: TrackingType, default: TrackingType.DAILY, required: false })
  @IsOptional()
  @IsEnum(TrackingType)
  trackingType?: TrackingType;

  @ApiProperty({ example: false, required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isSavings?: boolean;

  @ApiProperty({ example: 'Receipt', required: false, default: 'Receipt' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: '#10B981', required: false, default: '#10B981' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 'Everyday groceries, transport, airtime', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateBudgetDto {
  @ApiProperty({ example: 8, description: 'Month (1-12)' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2026, description: 'Year' })
  @IsNotEmpty()
  @IsInt()
  @Min(2020)
  @Max(2100)
  year: number;

  @ApiProperty({ example: 100000, description: 'Monthly income / salary' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive({ message: 'Income must be a positive number' })
  totalIncome: number;

  @ApiProperty({ example: 'August monthly salary budget', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: false, required: false, default: false })
  @IsOptional()
  @IsBoolean()
  allowOverAllocation?: boolean;

  @ApiProperty({ type: [CreateBudgetCategoryItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetCategoryItemDto)
  categories?: CreateBudgetCategoryItemDto[];
}
