import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateExpenseDto {
  @ApiProperty({ description: 'Budget ID' })
  @IsNotEmpty({ message: 'Budget ID is required' })
  @IsUUID()
  budgetId: string;

  @ApiProperty({ description: 'Budget Category ID' })
  @IsNotEmpty({ message: 'Budget Category ID is required' })
  @IsUUID()
  budgetCategoryId: string;

  @ApiProperty({ example: 2500, description: 'Expense amount' })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber()
  @IsPositive({ message: 'Amount must be positive' })
  amount: number;

  @ApiProperty({ example: 'Lunch at Mega Chicken' })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2026-08-27', description: 'Expense date (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Expense date is required' })
  @IsISO8601()
  expenseDate: string;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.CASH, required: false })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ example: 'Mega Chicken', required: false })
  @IsOptional()
  @IsString()
  merchant?: string;

  @ApiProperty({ example: 'With colleagues', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateExpenseDto {
  @ApiProperty({ description: 'Budget Category ID', required: false })
  @IsOptional()
  @IsUUID()
  budgetCategoryId?: string;

  @ApiProperty({ example: 3000, required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiProperty({ example: 'Dinner', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-08-27', required: false })
  @IsOptional()
  @IsISO8601()
  expenseDate?: string;

  @ApiProperty({ enum: PaymentMethod, required: false })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ example: 'Domino Pizza', required: false })
  @IsOptional()
  @IsString()
  merchant?: string;

  @ApiProperty({ example: 'Special treat', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class QueryExpenseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  budgetId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  budgetCategoryId?: string;

  @ApiProperty({ example: '2026-08-01', required: false })
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @ApiProperty({ example: '2026-08-31', required: false })
  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: PaymentMethod, required: false })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ default: 1, required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ default: 20, required: false })
  @IsOptional()
  limit?: number;

  @ApiProperty({ default: 'expenseDate', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ default: 'desc', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
