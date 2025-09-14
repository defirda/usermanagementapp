import { Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { loginService, refreshTokenService, logoutService } from '../services/auth.service';

const loginSchema = z.object({
  username: z.string().min(4, 'Username minimal 4 karakter'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export async function loginController(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    const error = parsed.error;
    if (error instanceof ZodError) {
      const validations: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const key = String(issue.path[0]);
        validations[key] = issue.message;
      });

      req.log.warn({ requestId: req.requestId, validations }, 'Login gagal: input tidak valid');
      return res.status(400).json({
        message: 'Invalid Input',
        validations,
      });
    }

    req.log.warn({ requestId: req.requestId }, 'Login gagal: input tidak valid');
    return res.status(400).json({ message: 'Bad Request' });
  }

  const { username, password } = parsed.data;

  try {
    const result = await loginService(username, password);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    req.log.info(
      {
        requestId: req.requestId,
        userId: result.user.id,
        role: result.user.role,
      },
      `Login berhasil untuk ${username}`
    );

    res.status(200).json({
      data: {
        token: result.token,
        expiredAt: result.expiredAt,
        user: result.user,
      },
    });
  } catch (err: any) {
    req.log.error(
      {
        requestId: req.requestId,
        username,
        error: err.message,
      },
      'Login gagal: username atau password salah'
    );

    return res.status(401).json({ message: err.message || 'Bad Request' });
  }
}

export async function refreshTokenController(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token tidak ditemukan di cookie' });
    }

    const result = await refreshTokenService(refreshToken);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    req.log.info(
      {
        requestId: req.requestId,
      },
      `Refresh token berhasil`
    );
    res.status(200).json({
      data: {
        accessToken: result.accessToken,
        expiredAt: result.expiredAt,
      },
    });
  } catch (err: any) {
    res.status(err.statusCode || 401).json({ message: err.message });
  }
}

export async function logoutController(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token tidak ditemukan di cookie' });
    }

    await logoutService(refreshToken);
    res.clearCookie('refreshToken');
    req.log.info(
      {
        requestId: req.requestId,
      },
      `Logout berhasil`
    );
    res.status(200).json({ message: 'Berhasil logout' });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
}
