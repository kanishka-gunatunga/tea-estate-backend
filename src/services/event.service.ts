import type { EventCategory, Recurrence } from '../../generated/prisma';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { parseDateOnly } from '../utils/date';

const eventInclude = {
  estate: { select: { id: true, name: true } },
};

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatEvent(event: {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  recurrence: Recurrence;
  color: string;
  category: EventCategory;
  estateId: string | null;
  estate: { id: string; name: string } | null;
}) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startDate: formatDate(event.startDate),
    endDate: event.endDate ? formatDate(event.endDate) : null,
    recurrence: event.recurrence,
    color: event.color,
    category: event.category,
    estateId: event.estateId,
    estateName: event.estate?.name ?? null,
  };
}

async function validateEstateRef(estateId?: string | null) {
  if (!estateId) {
    return;
  }

  const estate = await prisma.estate.findUnique({ where: { id: estateId } });

  if (!estate) {
    throw new AppError(400, 'Estate not found');
  }
}

export async function listEvents(filters: {
  startDate?: string;
  endDate?: string;
  estateId?: string;
}) {
  const events = await prisma.calendarEvent.findMany({
    where: {
      estateId: filters.estateId,
      ...(filters.startDate || filters.endDate
        ? {
            startDate: {
              ...(filters.startDate ? { gte: parseDateOnly(filters.startDate) } : {}),
              ...(filters.endDate ? { lte: parseDateOnly(filters.endDate) } : {}),
            },
          }
        : {}),
    },
    include: eventInclude,
    orderBy: [{ startDate: 'asc' }, { title: 'asc' }],
  });

  return events.map(formatEvent);
}

export async function getEventById(id: string) {
  const event = await prisma.calendarEvent.findUnique({
    where: { id },
    include: eventInclude,
  });

  if (!event) {
    throw new AppError(404, 'Event not found');
  }

  return formatEvent(event);
}

export async function createEvent(data: {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  recurrence: Recurrence;
  color: string;
  category: EventCategory;
  estateId?: string;
}) {
  await validateEstateRef(data.estateId);

  const event = await prisma.calendarEvent.create({
    data: {
      title: data.title,
      description: data.description,
      startDate: parseDateOnly(data.startDate),
      endDate: data.endDate ? parseDateOnly(data.endDate) : undefined,
      recurrence: data.recurrence,
      color: data.color,
      category: data.category,
      estateId: data.estateId,
    },
    include: eventInclude,
  });

  return formatEvent(event);
}

export async function updateEvent(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    startDate: string;
    endDate: string | null;
    recurrence: Recurrence;
    color: string;
    category: EventCategory;
    estateId: string | null;
  }>,
) {
  const existing = await prisma.calendarEvent.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'Event not found');
  }

  if (data.estateId !== undefined) {
    await validateEstateRef(data.estateId);
  }

  const event = await prisma.calendarEvent.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      recurrence: data.recurrence,
      color: data.color,
      category: data.category,
      estateId: data.estateId,
      ...(data.startDate ? { startDate: parseDateOnly(data.startDate) } : {}),
      ...(data.endDate !== undefined
        ? { endDate: data.endDate ? parseDateOnly(data.endDate) : null }
        : {}),
    },
    include: eventInclude,
  });

  return formatEvent(event);
}

export async function deleteEvent(id: string) {
  const existing = await prisma.calendarEvent.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'Event not found');
  }

  await prisma.calendarEvent.delete({ where: { id } });

  return { id };
}
