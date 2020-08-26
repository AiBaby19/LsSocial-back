const { ErrorHandler } = require('../utils/error');

const handleErrors = (err, req, res, next) => {
  if (err instanceof ErrorHandler) {
    return res.status(err.getErrorCode()).json(showError(err));
  }

  return res.status(500).json(showError(err));
};

const showError = (err) => {
  return { status: 'error', message: err.message };
};

module.exports = handleErrors;
