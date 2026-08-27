import { FinancialCalc } from './financial-calc';

describe('FinancialCalc', () => {
  it('should format values to 2 decimal places properly', () => {
    expect(FinancialCalc.format(100.555)).toBe(100.56);
    expect(FinancialCalc.format('2500.5')).toBe(2500.5);
    expect(FinancialCalc.format(null)).toBe(0);
    expect(FinancialCalc.format(undefined)).toBe(0);
  });

  it('should accurately sum numbers without floating point precision issues', () => {
    // 0.1 + 0.2 is 0.30000000000000004 in standard JS float
    const result = FinancialCalc.sum([0.1, 0.2]);
    expect(result).toBe(0.3);

    const expenses = [2500, 1000, 500];
    expect(FinancialCalc.sum(expenses)).toBe(4000);
  });

  it('should safely calculate differences', () => {
    expect(FinancialCalc.subtract(100000, 28750)).toBe(71250);
    expect(FinancialCalc.subtract(30000, 4000)).toBe(26000);
  });

  it('should calculate percentages accurately and handle division by zero', () => {
    expect(FinancialCalc.percentage(22000, 30000)).toBe(73.3);
    expect(FinancialCalc.percentage(50000, 100000)).toBe(50);
    expect(FinancialCalc.percentage(100, 0)).toBe(0);
  });

  it('should return correct warning status categories according to thresholds', () => {
    expect(FinancialCalc.getStatus(50)).toBe('HEALTHY');
    expect(FinancialCalc.getStatus(69.9)).toBe('HEALTHY');
    expect(FinancialCalc.getStatus(70)).toBe('WARNING');
    expect(FinancialCalc.getStatus(85)).toBe('WARNING');
    expect(FinancialCalc.getStatus(90)).toBe('CRITICAL');
    expect(FinancialCalc.getStatus(99.9)).toBe('CRITICAL');
    expect(FinancialCalc.getStatus(100.1)).toBe('OVER_BUDGET');
  });
});
