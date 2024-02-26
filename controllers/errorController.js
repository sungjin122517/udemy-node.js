const AppError = require('../utils/appError');

// 119. Handling invalid database ids
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// 120. Handling duplicate database fields
const handleDuplicateFieldsDB = (err) => {
  // find a text between quotes ""
  const value = err.keyValue.name;
  // console.log(value);
  const message = `Duplicate field value: ${value}. Please use other value.`;
  return new AppError(message, 400);
};

// 121. Handling Mongoose validation error
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired', 401);

// 118. Errors During Development vs Production
const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // render error.pug
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      // Programming or other unknown error: don't leak error details
    }
    // 1) Log error
    // console.error('ERROR', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong.',
    });
  }
  // RENDERED WEBSITE
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });

    // Programming or other unknown error: don't leak error details
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later',
  });
};

// 113. Implementing a global error handling middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // 500 is internal server error
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // console.log(err.name);
    let error = { ...err };
    error.message = err.message;

    // console.log(error.name);
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (err.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (err.name === 'JsonExpiredError') {
      error = handleJWTExpiredError();
    }
    sendErrorProd(error, req, res);
  }
};
