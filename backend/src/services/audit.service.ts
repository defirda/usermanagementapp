import { getAuditLogsFromDB } from '../repositories/audit.repo';

export async function getAuditLogsService({ page, limit }: { page: number; limit: number }) {
  const skip = (page - 1) * limit;
  const [logs, total]: [any[], number] = await getAuditLogsFromDB(skip, limit);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: logs,
  };
}
