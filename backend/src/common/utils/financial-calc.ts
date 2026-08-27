import Decimal from 'decimal.js';

export class FinancialCalc {
  /**
   * Convert any number/string/Decimal to safe 2-decimal place string representation
   */
  static format(val: number | string | Decimal | null | undefined): number {
    if (val === null || val === undefined) return 0;
    return new Decimal(val.toString()).toDecimalPlaces(2).toNumber();
  }

  /**
   * Sum an array of amounts safely
   */
  static sum(values: (number | string | Decimal | null | undefined)[]): number {
    const total = values.reduce<Decimal>((acc, cur) => {
      if (cur === null || cur === undefined) return acc;
      return acc.plus(new Decimal(cur.toString()));
    }, new Decimal(0));
    return total.toDecimalPlaces(2).toNumber();
  }

  /**
   * Subtraction: a - b
   */
  static subtract(a: number | string | Decimal, b: number | string | Decimal): number {
    const decA = new Decimal(a?.toString() || 0);
    const decB = new Decimal(b?.toString() || 0);
    return decA.minus(decB).toDecimalPlaces(2).toNumber();
  }

  /**
   * Percentage: (portion / total) * 100
   */
  static percentage(portion: number | string | Decimal, total: number | string | Decimal): number {
    const decPortion = new Decimal(portion?.toString() || 0);
    const decTotal = new Decimal(total?.toString() || 0);
    if (decTotal.isZero()) return 0;
    return decPortion.dividedBy(decTotal).times(100).toDecimalPlaces(1).toNumber();
  }

  /**
   * Calculate budget category health status
   */
  static getStatus(percentage: number): 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OVER_BUDGET' {
    if (percentage > 100) return 'OVER_BUDGET';
    if (percentage >= 90) return 'CRITICAL';
    if (percentage >= 70) return 'WARNING';
    return 'HEALTHY';
  }
}
