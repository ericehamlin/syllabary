'use strict';

import Config from './Config.js';

export const LogLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const Logger = {
  debug: (...args) => {
    if (Config.logLevel === LogLevels.debug) {
      console.debug(...args)
    }
  },

  info: (...args) => {
    if (Config.logLevel >= LogLevels.info) {
      console.info(...args)
    }
  },

  warn: (...args) => {
    if (Config.logLevel >= LogLevels.warn) {
      console.warn(...args);
    }

  },
  error: (...args) => {
    console.error(...args);
  },
};

export default Logger;
