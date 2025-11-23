export function corsOptions(req, callback) {
  const allowedOrigins = process.env.WHITELISTED_DOMAINS.split(',');

  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
  };
  return corsOptions;
}
