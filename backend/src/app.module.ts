import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BudgetsModule } from './budgets/budgets.module';
import { BudgetCategoriesModule } from './budget-categories/budget-categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    BudgetsModule,
    BudgetCategoriesModule,
    ExpensesModule,
    DashboardModule,
    ReportsModule,
  ],
})
export class AppModule {}
