import { prisma } from '../prisma/client';

export interface GetListUserParams {
  page: number;
  limit: number;
  q?: string;
  role?: string;
  createdFrom?: Date;
  createdTo?: Date;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export async function getListUserFromDB(params: GetListUserParams) {
  const {
    page,
    limit,
    q,
    role,
    createdFrom,
    createdTo,
    sortBy = 'createdAt',
    sortDir = 'desc',
  } = params;

  const where: any = { deletedAt: null };

  if (q) {
    where.OR = [{ username: { contains: q } }, { name: { contains: q } }];
  }

  if (role) where.role = role;

  if (createdFrom || createdTo) {
    where.createdAt = {};
    if (createdFrom) where.createdAt.gte = createdFrom;
    if (createdTo) where.createdAt.lte = createdTo;
  }

  const totalData = await prisma.user.count({ where });

  const users = await prisma.user.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: sortDir },
  });

  return { users, totalData };
}

export async function getUserByIdFromDB(id: number) {
  return prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getActiveUserById(id: number) {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      passwordHash: true,
    },
  });
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  const existing = await prisma.user.findFirst({
    where: {
      username,
      deletedAt: null,
    },
    select: { id: true },
  });
  return !!existing;
}

export async function createUserToDB(data: {
  name: string;
  username: string;
  passwordHash: string;
  role: string;
  createdBy: number;
}) {
  return prisma.user.create({
    data: {
      name: data.name,
      username: data.username,
      passwordHash: data.passwordHash,
      role: data.role,
      createdBy: data.createdBy,
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function updateUserInDB(
  id: number,
  data: Partial<{ name: string; username: string; role: 'admin' | 'user' }>
) {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateUserPasswordInDB(id: number, hashedPassword: string) {
  return prisma.user.update({
    where: { id },
    data: { passwordHash: hashedPassword },
  });
}

export async function softDeleteUserById(id: number) {
  return prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}
