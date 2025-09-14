import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Zod validation error
  if (err.name === 'ZodError' && err.errors) {
    const validations: Record<string, string> = {};
    err.errors.forEach((e: any) => {
      validations[e.path[0]] = e.message;
    });

    return res.status(400).json({
      message: 'Invalid Input',
      validations,
    });
  }

  // Custom error with statusCode
  if (err.statusCode && err.message) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Fallback error
  return res.status(400).json({ message: 'Bad Request' });
}
