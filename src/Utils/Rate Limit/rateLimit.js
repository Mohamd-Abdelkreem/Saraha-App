import rateLimit from 'express-rate-limit';
export const rateLimitConfig = ({ message, windowMs, limit } = {}) => {
  return rateLimit({
    windowMs: windowMs || 15 * 60 * 1000,
    limit: limit || 3,
    message:
      message ||
      'Too many requests from this IP, please try again after a minute',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export default rateLimitConfig;
