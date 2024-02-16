const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // console.log("🤔",err.keyValue.name)
  // const value =  err.errmsg.match(/(["'])(\\?.)*?\1/)[0]

  const message = `Duplicate field value: '${err.keyValue.name}'. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('invalid token. please login again!', 401);
const handleJWTExpiredError = () => new AppError('your session has expired. please login again!', 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // RENDERED WEBSITE
  console.error('error 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      // operational, trusted error: send message to client
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // programming or other unknown error: don't leak error details
    // 1) log error
    console.error('error 💥', err);

    // 2) send generic message
    return res.status(500).json({
      status: 'error',
      message: 'we are trying to fix the issue. please be patient. thank you.',
    });
  }

  // RENDERED WEBSITE
  if (err.isOperational) {
    // operational, trusted error: send message to client
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // programming or other unknown error: don't leak error details
  // 1) log error
  console.error('error 💥', err);

  // 2) send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    //  if(error.name === "ValidationError") error = handleValidationErrorDB(error)
    if (error._message === 'Validation failed') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
