import pino from 'pino';

export const logger = pino({
  level: process.env.DEBUG ? 'debug' : 'info',
  transport: process.env.DEBUG
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
});
