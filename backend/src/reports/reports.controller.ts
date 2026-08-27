import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('monthly')
  @ApiOperation({ summary: 'Get in-depth monthly financial report' })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @ApiQuery({ name: 'year', required: true, type: Number })
  getMonthlyReport(
    @CurrentUser('id') userId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.reportsService.getMonthlyReport(userId, month, year);
  }

  @Get('historical')
  @ApiOperation({ summary: 'Get historical income, spending, and savings trends' })
  getHistoricalTrends(@CurrentUser('id') userId: string) {
    return this.reportsService.getHistoricalTrends(userId);
  }
}
