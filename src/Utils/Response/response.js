export const asyncErrorHandler = (fn) => {
  return async (req, res, next) => {
    await fn(req, res, next).catch((error) => {
      return next(error, { cause: 500 });
    });
  };
};

export const successResponse = ({
  res,
  data,
  message = 'Success',
  statusCode = 200,
}) => {
  return res.status(statusCode).json({
    message,
    data,
  });
};
