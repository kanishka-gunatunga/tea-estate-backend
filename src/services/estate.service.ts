import type { EstateStatus, SectionStatus } from '../../generated/prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { buildMapsLink } from '../utils/maps';

function formatEstate(estate: {
  id: string;
  name: string;
  location: string;
  mapsLink: string | null;
  area: number | null;
  establishedYear: number | null;
  planter: string | null;
  supervisor: string | null;
  status: EstateStatus;
  sections: Array<{
    id: string;
    name: string;
    area: number | null;
    description: string | null;
    status: SectionStatus;
  }>;
}) {
  return {
    id: estate.id,
    name: estate.name,
    location: estate.location,
    mapsLink: estate.mapsLink,
    area: estate.area,
    establishedYear: estate.establishedYear,
    planter: estate.planter,
    supervisor: estate.supervisor,
    status: estate.status,
    sections: estate.sections.map((section) => ({
      id: section.id,
      name: section.name,
      area: section.area,
      description: section.description,
      status: section.status,
    })),
  };
}

const estateInclude = {
  sections: {
    orderBy: { name: 'asc' as const },
  },
};

export async function listEstates(status?: EstateStatus, estateId?: string) {
  const estates = await prisma.estate.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(estateId ? { id: estateId } : {}),
    },
    include: estateInclude,
    orderBy: { name: 'asc' },
  });

  return estates.map(formatEstate);
}

export async function getEstateById(id: string) {
  const estate = await prisma.estate.findUnique({
    where: { id },
    include: estateInclude,
  });

  if (!estate) {
    throw new AppError(404, 'Estate not found');
  }

  return formatEstate(estate);
}

export async function createEstate(data: {
  name: string;
  location: string;
  mapsLink?: string;
  area?: number;
  establishedYear?: number;
  planter?: string;
  supervisor?: string;
  status: EstateStatus;
}) {
  const estate = await prisma.estate.create({
    data: {
      ...data,
      mapsLink: buildMapsLink(data.location, data.mapsLink),
    },
    include: estateInclude,
  });

  return formatEstate(estate);
}

export async function updateEstate(
  id: string,
  data: Partial<{
    name: string;
    location: string;
    mapsLink: string;
    area: number;
    establishedYear: number;
    planter: string;
    supervisor: string;
    status: EstateStatus;
  }>,
) {
  const existing = await prisma.estate.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'Estate not found');
  }

  const location = data.location ?? existing.location;
  const mapsLink =
    data.mapsLink !== undefined || data.location !== undefined
      ? buildMapsLink(location, data.mapsLink ?? existing.mapsLink)
      : existing.mapsLink;

  const estate = await prisma.estate.update({
    where: { id },
    data: {
      ...data,
      mapsLink,
    },
    include: estateInclude,
  });

  return formatEstate(estate);
}

export async function deleteEstate(id: string) {
  const existing = await prisma.estate.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'Estate not found');
  }

  const estate = await prisma.estate.update({
    where: { id },
    data: { status: 'inactive' },
    include: estateInclude,
  });

  return formatEstate(estate);
}

export async function createSection(
  estateId: string,
  data: { name: string; area?: number; description?: string },
) {
  const estate = await prisma.estate.findUnique({ where: { id: estateId } });

  if (!estate) {
    throw new AppError(404, 'Estate not found');
  }

  await prisma.section.create({
    data: {
      estateId,
      ...data,
    },
  });

  return getEstateById(estateId);
}

export async function updateSection(
  estateId: string,
  sectionId: string,
  data: Partial<{ name: string; area: number; description: string }>,
) {
  const section = await prisma.section.findFirst({
    where: { id: sectionId, estateId },
  });

  if (!section) {
    throw new AppError(404, 'Section not found');
  }

  await prisma.section.update({
    where: { id: sectionId },
    data,
  });

  return getEstateById(estateId);
}

export async function deleteSection(estateId: string, sectionId: string) {
  const section = await prisma.section.findFirst({
    where: { id: sectionId, estateId },
  });

  if (!section) {
    throw new AppError(404, 'Section not found');
  }

  await prisma.section.update({
    where: { id: sectionId },
    data: { status: 'inactive' },
  });

  return getEstateById(estateId);
}
