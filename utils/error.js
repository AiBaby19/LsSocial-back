class ErrorHandler extends Error {
    constructor(message) {
      super();
      this.message = message;
    }
  
    getErrorCode() {
      if (this instanceof BadRequest) return 400;
      if (this instanceof SyntaxError) return 401;
      if (this instanceof NotFound) return 404;
      return 500;
    }
  }
  
  class BadRequest extends ErrorHandler {}
  class NotFound extends ErrorHandler {}
  class SyntaxError extends ErrorHandler {}
  
  module.exports = {
    ErrorHandler,
    BadRequest,
    SyntaxError,
    NotFound,
  };
  