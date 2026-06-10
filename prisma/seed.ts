import 'dotenv/config';

import bcrypt from 'bcrypt';
import { prisma } from '../src/config/database';

const SALT_ROUNDS = 10;

function calcPayment(units: number, rate: number): number {
  return Math.round(units * rate * 100) / 100;
}

async function clearDatabase() {
  await prisma.workerAssignment.deleteMany();
  await prisma.dailyAssignment.deleteMany();
  await prisma.employeeService.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.user.deleteMany();
  await prisma.service.deleteMany();
  await prisma.section.deleteMany();
  await prisma.estate.deleteMany();
  await prisma.backupRecord.deleteMany();
  await prisma.backupSettings.deleteMany();
}

async function main() {
  console.log('Clearing existing data...');
  await clearDatabase();

  const passwordHash = await bcrypt.hash('admin123', SALT_ROUNDS);

  console.log('Seeding estates and sections...');
  await prisma.estate.create({
    data: {
      id: 'estate-1',
      name: 'Greenleaf Tea Estate',
      location: 'Nuwara Eliya, Sri Lanka',
      mapsLink: 'https://maps.google.com/?q=Nuwara+Eliya+Sri+Lanka',
      area: 450,
      establishedYear: 2005,
      planter: 'Carter Bator',
      supervisor: 'Carter Bator',
      status: 'active',
      sections: {
        create: [
          {
            id: 'sec-1',
            name: 'Upper Division',
            area: 120,
            description: 'High-altitude plucking section',
          },
          {
            id: 'sec-2',
            name: 'Lower Division',
            area: 180,
            description: 'Main cultivation area',
          },
        ],
      },
    },
  });

  await prisma.estate.create({
    data: {
      id: 'estate-2',
      name: 'Highland View Estate',
      location: 'Badulla, Sri Lanka',
      mapsLink: 'https://maps.google.com/?q=Badulla+Sri+Lanka',
      area: 320,
      establishedYear: 1998,
      planter: 'Anura Perera',
      supervisor: 'Nimal Silva',
      status: 'active',
      sections: {
        create: [
          {
            id: 'sec-3',
            name: 'North Block',
            area: 95,
            description: 'Young tea bushes',
          },
          {
            id: 'sec-4',
            name: 'South Block',
            area: 110,
            description: 'Mature tea fields',
          },
        ],
      },
    },
  });

  console.log('Seeding services...');
  const services = [
    {
      id: 'service-1',
      name: 'Weeding',
      description: 'Manual weed removal between tea bushes',
      rate: 350,
      unitType: 'Hours' as const,
    },
    {
      id: 'service-2',
      name: 'Pruning',
      description: 'Trimming and shaping tea bushes',
      rate: 400,
      unitType: 'Hours' as const,
    },
    {
      id: 'service-3',
      name: 'Fertilizing',
      description: 'Application of organic and chemical fertilizer',
      rate: 1200,
      unitType: 'Acres' as const,
    },
    {
      id: 'service-4',
      name: 'Pesticide Spraying',
      description: 'Pest and disease control spraying',
      rate: 250,
      unitType: 'Units' as const,
    },
    {
      id: 'service-5',
      name: 'Irrigation',
      description: 'Water management and irrigation work',
      rate: 300,
      unitType: 'Hours' as const,
    },
    {
      id: 'service-6',
      name: 'Leaf Plucking',
      description: 'Hand plucking of tea leaves',
      rate: 50,
      unitType: 'KG' as const,
    },
  ];

  for (const service of services) {
    await prisma.service.create({
      data: {
        ...service,
        status: 'active',
      },
    });
  }

  console.log('Seeding users...');
  await prisma.user.create({
    data: {
      id: 'user-admin',
      name: 'System Administrator',
      email: 'admin@gmail.com',
      phone: '+94 77 123 4567',
      address: '12 Lake Road, Nuwara Eliya, Sri Lanka',
      role: 'Administrator',
      status: 'active',
      passwordHash,
    },
  });

  await prisma.user.create({
    data: {
      id: 'user-planter-1',
      name: 'Carter Bator',
      email: 'carter@greenleaf.com',
      phone: '+94 77 234 5678',
      address: 'Greenleaf Estate Bungalow, Nuwara Eliya',
      role: 'Planter',
      status: 'active',
      assignedEstateId: 'estate-1',
      passwordHash: await bcrypt.hash('planter123', SALT_ROUNDS),
    },
  });

  await prisma.user.create({
    data: {
      id: 'user-supervisor-1',
      name: 'Nimal Silva',
      email: 'nimal@highland.com',
      phone: '+94 77 345 6789',
      role: 'Supervisor',
      status: 'active',
      assignedEstateId: 'estate-2',
      passwordHash: await bcrypt.hash('supervisor123', SALT_ROUNDS),
    },
  });

  console.log('Seeding employees...');
  const employees = [
    {
      id: 'EMP001',
      name: 'Kamal Perera',
      gender: 'Male' as const,
      phone: '+94 71 111 2222',
      nic: '199512345678',
      estateId: 'estate-1',
      serviceIds: ['service-1', 'service-6'],
    },
    {
      id: 'EMP002',
      name: 'Sunil Fernando',
      gender: 'Male' as const,
      phone: '+94 71 222 3333',
      nic: '198812345679',
      estateId: 'estate-1',
      serviceIds: ['service-2', 'service-5'],
    },
    {
      id: 'EMP003',
      name: 'Malini Jayawardena',
      gender: 'Female' as const,
      phone: '+94 71 333 4444',
      nic: '199212345680',
      estateId: 'estate-1',
      serviceIds: ['service-6'],
    },
    {
      id: 'EMP004',
      name: 'Ravi Kumara',
      gender: 'Male' as const,
      phone: '+94 71 444 5555',
      nic: '199012345681',
      estateId: 'estate-2',
      serviceIds: ['service-3', 'service-4'],
    },
    {
      id: 'EMP005',
      name: 'Chamari Dias',
      gender: 'Female' as const,
      phone: '+94 71 555 6666',
      nic: '199312345682',
      estateId: 'estate-2',
      serviceIds: ['service-6', 'service-1'],
    },
  ];

  for (const employee of employees) {
    const { serviceIds, ...employeeData } = employee;
    await prisma.employee.create({
      data: {
        ...employeeData,
        status: 'active',
        serviceCategories: {
          create: serviceIds.map((serviceId) => ({ serviceId })),
        },
      },
    });
  }

  console.log('Seeding daily assignments...');
  const leafPluckingRate = 50;
  const assignment1Workers = [
    { employeeId: 'EMP001', units: 25 },
    { employeeId: 'EMP003', units: 30 },
  ];
  const assignment1Total = assignment1Workers.reduce(
    (sum, w) => sum + calcPayment(w.units, leafPluckingRate),
    0,
  );

  await prisma.dailyAssignment.create({
    data: {
      id: 'assign-1',
      date: new Date('2026-06-09'),
      estateId: 'estate-1',
      sectionId: 'sec-1',
      serviceId: 'service-6',
      totalAmount: assignment1Total,
      status: 'approved',
      workerAssignments: {
        create: assignment1Workers.map((w) => ({
          employeeId: w.employeeId,
          unitsCompleted: w.units,
          paymentAmount: calcPayment(w.units, leafPluckingRate),
        })),
      },
    },
  });

  const weedingRate = 350;
  await prisma.dailyAssignment.create({
    data: {
      id: 'assign-2',
      date: new Date('2026-06-09'),
      estateId: 'estate-1',
      sectionId: 'sec-2',
      serviceId: 'service-1',
      totalAmount: calcPayment(6, weedingRate),
      status: 'pending',
      workerAssignments: {
        create: [
          {
            employeeId: 'EMP001',
            unitsCompleted: 6,
            paymentAmount: calcPayment(6, weedingRate),
          },
        ],
      },
    },
  });

  await prisma.dailyAssignment.create({
    data: {
      id: 'assign-3',
      date: new Date('2026-06-08'),
      estateId: 'estate-2',
      sectionId: 'sec-4',
      serviceId: 'service-6',
      totalAmount: calcPayment(40, leafPluckingRate),
      status: 'approved',
      workerAssignments: {
        create: [
          {
            employeeId: 'EMP005',
            unitsCompleted: 40,
            paymentAmount: calcPayment(40, leafPluckingRate),
          },
        ],
      },
    },
  });

  console.log('Seeding expenses...');
  const expenses = [
    {
      id: 'expense-1',
      date: new Date('2026-06-05'),
      category: 'Transport' as const,
      description: 'Truck fuel for leaf transport',
      amount: 15000,
      estateId: 'estate-1',
      sectionId: 'sec-1',
      status: 'approved' as const,
    },
    {
      id: 'expense-2',
      date: new Date('2026-06-07'),
      category: 'Tools' as const,
      description: 'Pruning shears and gloves',
      amount: 8500,
      estateId: 'estate-1',
      status: 'pending' as const,
    },
    {
      id: 'expense-3',
      date: new Date('2026-06-06'),
      category: 'Utilities' as const,
      description: 'Electricity bill — factory',
      amount: 22000,
      estateId: 'estate-2',
      status: 'approved' as const,
    },
    {
      id: 'expense-4',
      date: new Date('2026-06-04'),
      category: 'Other' as const,
      description: 'Worker safety equipment',
      amount: 12000,
      estateId: 'estate-2',
      sectionId: 'sec-3',
      status: 'rejected' as const,
    },
  ];

  for (const expense of expenses) {
    await prisma.expense.create({ data: expense });
  }

  console.log('Seeding calendar events...');
  const events = [
    {
      id: 'event-1',
      title: 'Monthly Estate Review',
      description: 'Review harvest and payroll with management',
      startDate: new Date('2026-06-15'),
      endDate: new Date('2026-06-15'),
      recurrence: 'monthly' as const,
      color: '#3B82F6',
      category: 'Review' as const,
      estateId: 'estate-1',
    },
    {
      id: 'event-2',
      title: 'Fertilizer Application',
      description: 'Section B fertilizing schedule',
      startDate: new Date('2026-06-12'),
      recurrence: 'none' as const,
      color: '#22C55E',
      category: 'Cultivation' as const,
      estateId: 'estate-1',
    },
    {
      id: 'event-3',
      title: 'Safety Training',
      description: 'Pesticide handling workshop',
      startDate: new Date('2026-06-20'),
      endDate: new Date('2026-06-20'),
      recurrence: 'none' as const,
      color: '#F59E0B',
      category: 'Training' as const,
      estateId: 'estate-2',
    },
    {
      id: 'event-4',
      title: 'Payroll Processing',
      description: 'End of month payroll',
      startDate: new Date('2026-06-30'),
      recurrence: 'monthly' as const,
      color: '#8B5CF6',
      category: 'Finance' as const,
    },
  ];

  for (const event of events) {
    await prisma.calendarEvent.create({ data: event });
  }

  console.log('Seeding backup settings...');
  await prisma.backupSettings.create({
    data: {
      enabled: false,
      schedule: 'daily',
    },
  });

  console.log('Seed completed successfully.');
  console.log('');
  console.log('Test login credentials (for Phase 3):');
  console.log('  Admin:      admin@gmail.com / admin123');
  console.log('  Planter:    carter@greenleaf.com / planter123');
  console.log('  Supervisor: nimal@highland.com / supervisor123');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
