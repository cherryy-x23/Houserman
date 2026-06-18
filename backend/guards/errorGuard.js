class ServiceError extends Error {
  constructor(msg, code) {
    super(msg);
    this.code = code;
    this.isHandled = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorGuard = (err, req, res, next) => {
  let problem = { ...err };
  problem.message = err.message;

  if (err.name === 'CastError') {
    problem = new ServiceError('Resource not found', 404);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    problem = new ServiceError(`${field} already exists`, 400);
  }
  if (err.name === 'ValidationError') {
    const msgs = Object.values(err.errors).map((e) => e.message);
    problem = new ServiceError(msgs.join('. '), 400);
  }
  if (err.name === 'JsonWebTokenError') {
    problem = new ServiceError('Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    problem = new ServiceError('Token expired', 401);
  }

  res.status(problem.code || 500).json({
    ok: false,
    msg: problem.message || 'Server Error',
  });
};

module.exports = { ServiceError, errorGuard };
