import { Request, Response } from 'express';
import { getAuditLogsService } from '../services/audit.service';
import { getAuditLogsSchema } from '../validations/audit.validation';

export async function getAuditLogsController(req: Request, res: Response) {
  const result = getAuditLogsSchema.safeParse(req.query);
  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[0]);
      errors[field] = issue.message;
    }
    return res.status(400).json({ success: false, validations: errors });
  }

  try {
    const { page, limit } = result.data;
    const data = await getAuditLogsService({ page, limit });
    return res.status(200).json({ success: true, ...data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
