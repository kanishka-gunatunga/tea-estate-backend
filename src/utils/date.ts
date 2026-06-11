export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getServerToday(): Date {
  return parseDateOnly(formatDateOnly(new Date()));
}

export function getMonthDateRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));

  return { start, end };
}

export function getYearDateRange(year: number): { start: Date; end: Date } {
  return {
    start: parseDateOnly(`${year}-01-01`),
    end: parseDateOnly(`${year}-12-31`),
  };
}

export function getCurrentMonthRange(referenceDate: Date = getServerToday()): {
  start: Date;
  end: Date;
} {
  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth() + 1;

  return getMonthDateRange(year, month);
}
