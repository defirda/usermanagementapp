import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';

// export async function authorizeUserUpdate(req: Request, res: Response, next: NextFunction) {
//   const userId = req.user?.id;
//   const targetId = parseInt(req.params.id);

//   const user = await prisma.user.findUnique({ where: { id: userId } });
//   if (!user) return res.status(403).json({ message: 'User tidak ditemukan' });

//   if (user.role === 'admin') return next();
//   if (user.role === 'user' && user.id === targetId) return next();

//   return res.status(403).json({ message: 'Akses ditolak' });
// }
