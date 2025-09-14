import pino from 'pino';
import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';

// Buat folder logs jika belum ada
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Format nama file: YYYY-MM-DD.log
const logFileName = `${dayjs().format('DDMMYYYY')}.log`;
const logFilePath = path.join(logDir, logFileName);

// Logger utama
export const logger = pino(
  {
    level: 'info',
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.destination({ dest: logFilePath, sync: false })
);
