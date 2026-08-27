import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { CopyBudgetDto } from './dto/copy-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new monthly salary budget with category allocations' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateBudgetDto,
  ) {
    return this.budgetsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user budgets history' })
  findAll(@CurrentUser('id') userId: string) {
    return this.budgetsService.findAll(userId);
  }

  @Get('by-date')
  @ApiOperation({ summary: 'Get budget by month and year' })
  @ApiQuery({ name: 'month', type: Number, example: 8 })
  @ApiQuery({ name: 'year', type: Number, example: 2026 })
  findByDate(
    @CurrentUser('id') userId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.budgetsService.findByDate(userId, month, year);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a budget by ID with categories and expenses summary' })
  findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.budgetsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update budget total income or notes' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget and all associated categories and expenses' })
  delete(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.budgetsService.delete(userId, id);
  }

  @Post(':id/copy')
  @ApiOperation({ summary: 'Copy budget category allocations to another month (without copying expenses)' })
  copy(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CopyBudgetDto,
  ) {
    return this.budgetsService.copy(userId, id, dto);
  }
}
