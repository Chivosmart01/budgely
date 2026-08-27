import { Test, TestingModule } from '@nestjs/testing';
import { BudgetsService } from './budgets.service';
import { PrismaService } from '../database/prisma.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import Decimal from 'decimal.js';

describe('BudgetsService', () => {
  let service: BudgetsService;
  let prisma: any;

  const mockPrisma = {
    budget: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    budgetCategory: {
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BudgetsService>(BudgetsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should reject budget creation if category allocations exceed total income without flag', async () => {
    mockPrisma.budget.findUnique.mockResolvedValue(null);

    await expect(
      service.create('user_1', {
        month: 8,
        year: 2026,
        totalIncome: 100000,
        allowOverAllocation: false,
        categories: [
          { name: 'Savings', allocatedAmount: 60000 },
          { name: 'Car', allocatedAmount: 50000 }, // Total 110,000 > 100,000
        ],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject duplicate budget for the same month and year', async () => {
    mockPrisma.budget.findUnique.mockResolvedValue({ id: 'existing_budget' });

    await expect(
      service.create('user_1', {
        month: 8,
        year: 2026,
        totalIncome: 100000,
      }),
    ).rejects.toThrow(ConflictException);
  });
});
