import { prisma } from '../prisma/client';
import bcrypt from 'bcryptjs';
import {
  generateAccessToken,
  generateRefreshToken,
  isRefreshTokenValid,
  verifyRefreshToken,
  revokeRefreshToken,
} from '../utils/jwt';
import { redis } from '../utils/redisClient';
import jwt from 'jsonwebtoken';

const REFRESH_SECRET = process.env.REFRESH_SECRET || 'default-secret';

interface RefreshPayload {
  userId: number;
  tokenId: string;
}

export async function loginService(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error('username atau password salah');
  }

  const { token, expiredAt } = generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  const refreshToken = await generateRefreshToken(user.id);

  const { passwordHash, ...userWithoutPassword } = user;

  return {
    token,
    refreshToken,
    expiredAt,
    user: userWithoutPassword,
  };
}

export async function refreshTokenService(refreshToken: string) {
  const payload = await verifyRefreshToken(refreshToken);
  const valid = await isRefreshTokenValid(payload.tokenId, payload.userId);
  if (!valid) {
    throw { statusCode: 401, message: 'Refresh token tidak ditemukan atau sudah digunakan' };
  }

  await revokeRefreshToken(payload.tokenId);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { role: true },
  });

  if (!user) {
    throw { statusCode: 404, message: 'User tidak ditemukan' };
  }

  const access = generateAccessToken({ userId: payload.userId, role: user.role });
  const newRefreshToken = await generateRefreshToken(payload.userId);

  return {
    accessToken: access.token,
    refreshToken: newRefreshToken,
    expiredAt: access.expiredAt,
  };
}

export async function logoutService(refreshToken: string) {
  const payload = await verifyRefreshToken(refreshToken);
  await revokeRefreshToken(payload.tokenId);
  return { message: 'Berhasil logout' };
}
