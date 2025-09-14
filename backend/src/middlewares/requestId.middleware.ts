const { v4: uuidv4 } = require('uuid');
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  req.requestId = uuidv4();
  res.setHeader('X-Request-Id', req.requestId!);
  next();
}
