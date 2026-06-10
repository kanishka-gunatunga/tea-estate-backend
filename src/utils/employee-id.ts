import { prisma } from '../config/database';

export async function generateEmployeeId(): Promise<string> {
  const employees = await prisma.employee.findMany({
    where: { id: { startsWith: 'EMP' } },
    select: { id: true },
  });

  const numbers = employees
    .map((employee) => Number.parseInt(employee.id.replace('EMP', ''), 10))
    .filter((value) => !Number.isNaN(value));

  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

  return `EMP${String(next).padStart(3, '0')}`;
}
