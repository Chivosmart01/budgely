import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetCategoriesService } from './budget-categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Budget Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class BudgetCategoriesController {
  constructor(private categoriesService: BudgetCategoriesService) {}

  @Post('budgets/:budgetId/categories')
  @ApiOperation({ summary: 'Add a new category to a budget' })
  create(
    @CurrentUser('id') userId: string,
    @Param('budgetId') budgetId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(userId, budgetId, dto);
  }

  @Get('budgets/:budgetId/categories')
  @ApiOperation({ summary: 'Get all categories for a budget' })
  findAllByBudget(
    @CurrentUser('id') userId: string,
    @Param('budgetId') budgetId: string,
  ) {
    return this.categoriesService.findAllByBudget(userId, budgetId);
  }

  @Get('budget-categories/:id')
  @ApiOperation({ summary: 'Get category details and daily expense breakdown for calendar heatmap' })
  findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.categoriesService.findOne(userId, id);
  }

  @Patch('budget-categories/:id')
  @ApiOperation({ summary: 'Update a budget category' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(userId, id, dto);
  }

  @Delete('budget-categories/:id')
  @ApiOperation({ summary: 'Delete a budget category and its expenses' })
  delete(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.categoriesService.delete(userId, id);
  }
}
