import jwt from 'jsonwebtoken';
const { v4: uuidv4 } = require('uuid');
import { redis } from '../utils/redisClient';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'default-secret';
const TOKEN_EXPIRES_IN = '60m';
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 hari

export function generateAccessToken(payload: { userId: number; role: string }) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
  const expiredAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  return { token, expiredAt };
}

export async function generateRefreshToken(userId: number): Promise<string> {
  const tokenId = uuidv4();
  const token = jwt.sign({ userId, tokenId }, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL });
  await redis.set(`refresh:${tokenId}`, userId, { EX: REFRESH_TOKEN_TTL });
  return token;
}

export async function verifyRefreshToken(
  token: string
): Promise<{ userId: number; tokenId: string }> {
  return jwt.verify(token, REFRESH_SECRET) as { userId: number; tokenId: string };
}

export async function revokeRefreshToken(tokenId: string) {
  await redis.del(`refresh:${tokenId}`);
}

export async function isRefreshTokenValid(tokenId: string, userId: number) {
  const stored = await redis.get(`refresh:${tokenId}`);
  return stored && Number(stored) === userId;
}
