import { PrismaClient, PaymentMethod, TrackingType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import Decimal from 'decimal.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Budgely database seeding...');

  // 1. Create or update Demo User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {
      passwordHash,
      name: 'Demo User',
    },
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      passwordHash,
      currency: 'NGN',
    },
  });

  console.log(`User created/verified: ${user.email}`);

  // Clean old budgets for clean seed
  await prisma.budget.deleteMany({
    where: { userId: user.id },
  });

  // 2. Create August 2026 Budget
  const augBudget = await prisma.budget.create({
    data: {
      userId: user.id,
      month: 8,
      year: 2026,
      totalIncome: new Decimal(500000),
      notes: 'August 2026 primary salary budget allocation',
    },
  });

  // Create Categories for August
  const savingsCat = await prisma.budgetCategory.create({
    data: {
      budgetId: augBudget.id,
      name: 'Savings',
      description: 'Emergency fund and long-term investments',
      icon: 'Savings',
      color: '#10B981',
      allocatedAmount: new Decimal(200000),
      trackingType: TrackingType.GENERAL,
      isSavings: true,
    },
  });

  const carCat = await prisma.budgetCategory.create({
    data: {
      budgetId: augBudget.id,
      name: 'Car & Fuel',
      description: 'Fuel, maintenance, repairs and toll gates',
      icon: 'DirectionsCar',
      color: '#3B82F6',
      allocatedAmount: new Decimal(100000),
      trackingType: TrackingType.DAILY,
      isSavings: false,
    },
  });

  const dailyExpensesCat = await prisma.budgetCategory.create({
    data: {
      budgetId: augBudget.id,
      name: 'Daily Expenses',
      description: 'Groceries, lunch, transport, airtime and essentials',
      icon: 'Receipt',
      color: '#F59E0B',
      allocatedAmount: new Decimal(100000),
      trackingType: TrackingType.DAILY,
      isSavings: false,
    },
  });

  const billsCat = await prisma.budgetCategory.create({
    data: {
      budgetId: augBudget.id,
      name: 'Bills & Utilities',
      description: 'Electricity, internet, estate dues',
      icon: 'FlashOn',
      color: '#8B5CF6',
      allocatedAmount: new Decimal(50000),
      trackingType: TrackingType.GENERAL,
      isSavings: false,
    },
  });

  const entertainmentCat = await prisma.budgetCategory.create({
    data: {
      budgetId: augBudget.id,
      name: 'Entertainment',
      description: 'Dining out, movies, streaming subscriptions and outings',
      icon: 'Movie',
      color: '#EC4899',
      allocatedAmount: new Decimal(50000),
      trackingType: TrackingType.DAILY,
      isSavings: false,
    },
  });

  console.log('Categories created for August 2026');

  // 3. Create Sample Expenses for August 2026
  const expensesData = [
    // August 27 exact test case from prompt: Food ₦2,500, Transport ₦1,000, Airtime ₦500 -> Total ₦4,000
    {
      budgetId: augBudget.id,
      budgetCategoryId: dailyExpensesCat.id,
      amount: new Decimal(2500),
      description: 'Food — Lunch at Mega Chicken',
      expenseDate: new Date('2026-08-27'),
      paymentMethod: PaymentMethod.DEBIT_CARD,
      merchant: 'Mega Chicken',
      notes: 'Lunch with colleagues',
    },
    {
      budgetId: augBudget.id,
      budgetCategoryId: dailyExpensesCat.id,
      amount: new Decimal(1000),
      description: 'Transport — Uber to Lekki Office',
      expenseDate: new Date('2026-08-27'),
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      merchant: 'Uber',
      notes: 'Morning commute',
    },
    {
      budgetId: augBudget.id,
      budgetCategoryId: dailyExpensesCat.id,
      amount: new Decimal(500),
      description: 'Airtime — MTN Recharge',
      expenseDate: new Date('2026-08-27'),
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      merchant: 'MTN',
      notes: 'Weekly data recharge',
    },

    // Other August Expenses
    {
      budgetId: augBudget.id,
      budgetCategoryId: carCat.id,
      amount: new Decimal(2500),
      description: 'Fuel at TotalEnergies',
      expenseDate: new Date('2026-08-26'),
      paymentMethod: PaymentMethod.DEBIT_CARD,
      merchant: 'TotalEnergies',
      notes: 'Full tank for the week',
    },
    {
      budgetId: augBudget.id,
      budgetCategoryId: entertainmentCat.id,
      amount: new Decimal(12000),
      description: 'Cinema Tickets & Popcorn',
      expenseDate: new Date('2026-08-24'),
      paymentMethod: PaymentMethod.DEBIT_CARD,
      merchant: 'Filmhouse Cinemas',
      notes: 'Weekend movie night',
    },
    {
      budgetId: augBudget.id,
      budgetCategoryId: dailyExpensesCat.id,
      amount: new Decimal(18500),
      description: 'Grocery Shopping at Hubmart',
      expenseDate: new Date('2026-08-20'),
      paymentMethod: PaymentMethod.DEBIT_CARD,
      merchant: 'Hubmart Supermarket',
      notes: 'Bi-weekly household groceries',
    },
    {
      budgetId: augBudget.id,
      budgetCategoryId: carCat.id,
      amount: new Decimal(35000),
      description: 'Brake Pad Replacement & Engine Oil',
      expenseDate: new Date('2026-08-18'),
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      merchant: 'AutoFix Workshop',
      notes: 'Routine service',
    },
    {
      budgetId: augBudget.id,
      budgetCategoryId: billsCat.id,
      amount: new Decimal(25000),
      description: 'EKEDC Prepaid Power Token',
      expenseDate: new Date('2026-08-15'),
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      merchant: 'EKEDC',
      notes: 'Electricity for August',
    },
    {
      budgetId: augBudget.id,
      budgetCategoryId: entertainmentCat.id,
      amount: new Decimal(15000),
      description: 'Dinner at Cactus Restaurant',
      expenseDate: new Date('2026-08-10'),
      paymentMethod: PaymentMethod.DEBIT_CARD,
      merchant: 'Cactus Restaurant',
      notes: 'Dinner date',
    },
    {
      budgetId: augBudget.id,
      budgetCategoryId: dailyExpensesCat.id,
      amount: new Decimal(14000),
      description: 'Market Groceries',
      expenseDate: new Date('2026-08-05'),
      paymentMethod: PaymentMethod.CASH,
      merchant: 'Local Market',
      notes: 'Fresh veggies, fruits and meat',
    },
    {
      budgetId: augBudget.id,
      budgetCategoryId: billsCat.id,
      amount: new Decimal(20000),
      description: 'Starlink Internet Monthly Subscription',
      expenseDate: new Date('2026-08-01'),
      paymentMethod: PaymentMethod.CREDIT_CARD,
      merchant: 'Starlink',
      notes: 'Monthly broadband bill',
    },
  ];

  for (const exp of expensesData) {
    await prisma.expense.create({
      data: {
        userId: user.id,
        ...exp,
      },
    });
  }

  console.log(`Created ${expensesData.length} sample expenses for August 2026`);

  // 4. Create July 2026 Budget for historical comparison
  const julyBudget = await prisma.budget.create({
    data: {
      userId: user.id,
      month: 7,
      year: 2026,
      totalIncome: new Decimal(480000),
      notes: 'July 2026 salary budget',
    },
  });

  const julySavingsCat = await prisma.budgetCategory.create({
    data: {
      budgetId: julyBudget.id,
      name: 'Savings',
      icon: 'Savings',
      color: '#10B981',
      allocatedAmount: new Decimal(180000),
      trackingType: TrackingType.GENERAL,
      isSavings: true,
    },
  });

  const julyDailyCat = await prisma.budgetCategory.create({
    data: {
      budgetId: julyBudget.id,
      name: 'Daily Expenses',
      icon: 'Receipt',
      color: '#F59E0B',
      allocatedAmount: new Decimal(100000),
      trackingType: TrackingType.DAILY,
      isSavings: false,
    },
  });

  await prisma.expense.createMany({
    data: [
      {
        userId: user.id,
        budgetId: julyBudget.id,
        budgetCategoryId: julyDailyCat.id,
        amount: new Decimal(75000),
        description: 'July Consolidated Everyday Expenses',
        expenseDate: new Date('2026-07-20'),
        paymentMethod: PaymentMethod.DEBIT_CARD,
      },
    ],
  });

  console.log('Seed completed successfully!');
  console.log('Demo Login: demo@example.com / Password123!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
