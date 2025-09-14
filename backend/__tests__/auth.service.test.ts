import {
  loginService,
  refreshTokenService,
  logoutService,
} from '../src/services/auth.service';

import { prisma } from '../src/prisma/client';
import * as jwtUtils from '../src/utils/jwt';
import bcrypt from 'bcryptjs';

jest.mock('../src/prisma/client', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../src/utils/jwt', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  isRefreshTokenValid: jest.fn(),
  revokeRefreshToken: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const mockUser = {
    id: 1,
    username: 'admin',
    passwordHash: 'hashedpass',
    role: 'admin',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // LOGIN
  it('should login successfully', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwtUtils.generateAccessToken as jest.Mock).mockReturnValue({
      token: 'access-token',
      expiredAt: '2025-09-14T06:00:00Z',
    });
    (jwtUtils.generateRefreshToken as jest.Mock).mockResolvedValue('refresh-token');

    const result = await loginService('admin', 'password');

    expect(result.token).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.user).toEqual({
      id: 1,
      username: 'admin',
      role: 'admin',
    });
  });

  it('should throw error if user not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(loginService('unknown', 'password')).rejects.toThrow('username atau password salah');
  });

  it('should throw error if password is incorrect', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(loginService('admin', 'wrongpass')).rejects.toThrow('username atau password salah');
  });

  // REFRESH TOKEN
  it('should refresh token successfully', async () => {
    const payload = { userId: 1, tokenId: 'abc' };
    (jwtUtils.verifyRefreshToken as jest.Mock).mockResolvedValue(payload);
    (jwtUtils.isRefreshTokenValid as jest.Mock).mockResolvedValue(true);
    (jwtUtils.revokeRefreshToken as jest.Mock).mockResolvedValue(undefined);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: 'admin' });
    (jwtUtils.generateAccessToken as jest.Mock).mockReturnValue({
      token: 'new-access-token',
      expiredAt: '2025-09-14T07:00:00Z',
    });
    (jwtUtils.generateRefreshToken as jest.Mock).mockResolvedValue('new-refresh-token');

    const result = await refreshTokenService('old-refresh-token');

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(result.expiredAt).toBe('2025-09-14T07:00:00Z');
  });

  it('should throw error if refresh token is invalid', async () => {
    const payload = { userId: 1, tokenId: 'abc' };
    (jwtUtils.verifyRefreshToken as jest.Mock).mockResolvedValue(payload);
    (jwtUtils.isRefreshTokenValid as jest.Mock).mockResolvedValue(false);

    await expect(refreshTokenService('invalid-token')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Refresh token tidak ditemukan atau sudah digunakan',
    });
  });

  it('should throw error if user not found during refresh', async () => {
    const payload = { userId: 1, tokenId: 'abc' };
    (jwtUtils.verifyRefreshToken as jest.Mock).mockResolvedValue(payload);
    (jwtUtils.isRefreshTokenValid as jest.Mock).mockResolvedValue(true);
    (jwtUtils.revokeRefreshToken as jest.Mock).mockResolvedValue(undefined);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(refreshTokenService('token')).rejects.toMatchObject({
      statusCode: 404,
      message: 'User tidak ditemukan',
    });
  });

  // LOGOUT
  it('should logout successfully', async () => {
    const payload = { tokenId: 'abc' };
    (jwtUtils.verifyRefreshToken as jest.Mock).mockResolvedValue(payload);
    (jwtUtils.revokeRefreshToken as jest.Mock).mockResolvedValue(undefined);

    const result = await logoutService('refresh-token');
    expect(result.message).toBe('Berhasil logout');
  });
});
