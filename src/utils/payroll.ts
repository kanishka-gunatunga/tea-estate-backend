export function calcPayment(units: number, rate: number): number {
  return Math.round(units * rate * 100) / 100;
}
