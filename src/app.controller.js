import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment FIRST, before other imports
const envFile =
  process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({ path: path.join(__dirname, 'Config', envFile) });

import express from 'express';
import cors from 'cors';
import colors from 'colors';
import morgan from 'morgan';
import helmet from 'helmet';

// Routers
import authRouter from './Modules/Auth/auth.controller.js';
import userRouter from './Modules/User/user.controller.js';
import messageRouter from './Modules/Message/message.controller.js';

// DB
import dbConnection from './DB/dbConnection.js';
import { attachRoutingWithLogger } from './Utils/logger/logger.js';
import { corsOptions } from './Utils/cors/cors.js';
import rateLimitConfig from './Utils/Rate Limit/rateLimit.js';

export const bootstrap = async () => {
  const app = express();
  const port = process.env.PORT || 3000;

  // app.use(rateLimitConfig());
  app.use(helmet());
  app.use(express.json());
  app.use(cors(corsOptions()));
  app.use(morgan('dev'));

  // DB Connection
  await dbConnection();

  // Routes (remove duplicate mounting)
  attachRoutingWithLogger({
    app,
    routerPath: '/api/auth',
    routerHandler: authRouter,
    logsFileName: 'auth.log',
  });
  attachRoutingWithLogger({
    app,
    routerPath: '/api/user',
    routerHandler: userRouter,
    logsFileName: 'user.log',
  });
  attachRoutingWithLogger({
    app,
    routerPath: '/api/message',
    routerHandler: messageRouter,
    logsFileName: 'message.log',
  });

  app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

  // Error handling middleware
  app.use((err, req, res, next) => {
    res.status(err.cause || 500).json({
      message: 'An unexpected error occurred. Please try again later.',
      error: err.message,
      stack: err.stack,
    });
  });

  // Not Found Middleware
  app.use((req, res, next) => {
    res.status(404).json({ message: 'Sorry, this route does not exist.' });
  });

  app.listen(port, () =>
    console.log(colors.bgBrightYellow(`Server listening on port ${port}`))
  );

  return app;
};

export default bootstrap;
