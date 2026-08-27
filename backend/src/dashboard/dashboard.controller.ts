import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get monthly dashboard financial summary' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getSummary(
    @CurrentUser('id') userId: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.dashboardService.getSummary(userId, month, year);
  }

  @Get('spending-chart')
  @ApiOperation({ summary: 'Get filterable expense spending bar chart data' })
  @ApiQuery({ name: 'timeframe', required: false, example: 'this_month' })
  @ApiQuery({ name: 'categoryId', required: false, example: 'all' })
  @ApiQuery({ name: 'view', required: false, example: 'daily' })
  @ApiQuery({ name: 'month', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getSpendingChart(
    @CurrentUser('id') userId: string,
    @Query()
    query: {
      timeframe?: string;
      categoryId?: string;
      view?: string;
      month?: number;
      year?: number;
      startDate?: string;
      endDate?: string;
    },
  ) {
    return this.dashboardService.getSpendingChart(userId, query);
  }

  @Get('category-breakdown')
  @ApiOperation({ summary: 'Get category spending breakdown for donut / pie charts' })
  @ApiQuery({ name: 'month', required: false })
  @ApiQuery({ name: 'year', required: false })
  getCategoryBreakdown(
    @CurrentUser('id') userId: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.dashboardService.getCategoryBreakdown(userId, month, year);
  }

  @Get('budget-vs-actual')
  @ApiOperation({ summary: 'Get budget vs actual comparisons' })
  @ApiQuery({ name: 'month', required: false })
  @ApiQuery({ name: 'year', required: false })
  getBudgetVsActual(
    @CurrentUser('id') userId: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.dashboardService.getBudgetVsActual(userId, month, year);
  }
}
