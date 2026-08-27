import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsNumber, Max, Min } from 'class-validator';

export class CopyBudgetDto {
  @ApiProperty({ example: 9, description: 'Target month (1-12)' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(12)
  targetMonth: number;

  @ApiProperty({ example: 2026, description: 'Target year' })
  @IsNotEmpty()
  @IsInt()
  @Min(2020)
  @Max(2100)
  targetYear: number;

  @ApiProperty({ example: 100000, description: 'Optional new salary amount for target month', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  newTotalIncome?: number;
}
