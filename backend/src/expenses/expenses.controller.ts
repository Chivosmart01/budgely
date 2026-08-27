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
import { ExpensesService } from './expenses.service';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  QueryExpenseDto,
} from './dto/expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new expense to a budget category' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List and filter expenses with pagination' })
  findAll(
    @CurrentUser('id') userId: string,
    @Query() query: QueryExpenseDto,
  ) {
    return this.expensesService.findAll(userId, query);
  }

  @Get('daily-calendar')
  @ApiOperation({ summary: 'Get daily aggregated expenses for a budget calendar' })
  @ApiQuery({ name: 'budgetId', required: true })
  @ApiQuery({ name: 'categoryId', required: false })
  getDailyCalendar(
    @CurrentUser('id') userId: string,
    @Query('budgetId') budgetId: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.expensesService.getDailyCalendar(userId, budgetId, categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense details by ID' })
  findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.expensesService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing expense' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense' })
  delete(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.expensesService.delete(userId, id);
  }
}
