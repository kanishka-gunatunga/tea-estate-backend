export function toNumber(value: number | { toNumber(): number }): number {
  return typeof value === 'number' ? value : value.toNumber();
}
