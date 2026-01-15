class ApiError extends Error {
    constructor(status, code, message) {
      super(message);
      this.status = status;
      this.code = code;
    }
}
  
const sendError = (res, err) => {
    const status = err.status || 500;
    const code = err.code || 'INTERNAL_ERROR';
    const message = err.message || 'Something went wrong';
  
    return res.status(status).json({
      error: {
        code,
        message,
        status
      }
    });
};
  
module.exports = { ApiError, sendError };