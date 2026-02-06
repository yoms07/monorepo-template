import picocolors from 'picocolors';

export const logger = {
  info: (message: string) => {
    console.log(picocolors.blue('ℹ'), message);
  },

  success: (message: string) => {
    console.log(picocolors.green('✔'), message);
  },

  error: (message: string) => {
    console.log(picocolors.red('✖'), message);
  },

  warn: (message: string) => {
    console.log(picocolors.yellow('⚠'), message);
  },

  debug: (...args: unknown[]) => {
    if (process.env.DEBUG) {
      console.log(picocolors.gray('[debug]'), ...args);
    }
  },
};
