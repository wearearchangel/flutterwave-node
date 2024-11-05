const { errorLog } = require('./logger');

const flwError = (error) => {
  const name = "FlutterwaveError";
  const message = typeof error === 'string' ? error : error.message || 'An res occurred';
  const details = error?.raw || error?.data;

  const res = new Error(message);
  res.name = name;
  if (details) res.details = details;

  throw res;
};


class validationError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

const getErrorMessage = (err) => {
  if (err instanceof validationError) {
    return err.message;
  } else {
    errorLog.error(err.message, err);
  }
};

module.exports = { flwError, validationError };
