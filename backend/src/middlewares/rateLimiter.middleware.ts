import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 menit
  max: 100, // maksimal 100 request
  message: {
    message: 'Terlalu banyak permintaan dari IP ini, coba lagi nanti.',
  },
  standardHeaders: true, // 'RateLimit-*' headers
  legacyHeaders: false, // disable 'X-RateLimit-*' headers
});
