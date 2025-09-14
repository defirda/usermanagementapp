import { prisma } from '../prisma/client';

export async function logAudit({
  actorId,
  entity,
  entityId,
  action,
  before,
  after,
}: {
  actorId: number;
  entity: string;
  entityId: number;
  action: string;
  before?: any;
  after?: any;
}) {
  return prisma.auditLog.create({
    data: {
      actorId,
      entity,
      entityId,
      action,
      before,
      after,
    },
  });
}

export async function getAuditLogsFromDB(skip: number, take: number): Promise<[any[], number]> {
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take,
      orderBy: { createdAt: 'asc' },
    }),
    prisma.auditLog.count(),
  ]);

  return [logs, total];
}
