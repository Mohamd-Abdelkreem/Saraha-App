import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function attachRoutingWithLogger({
  app,
  routerPath,
  routerHandler,
  logsFileName,
}) {
  const logStream = fs.createWriteStream(
    path.join(__dirname, '../../Logs', logsFileName),
    {
      flags: 'a',
    }
  );

  app.use(routerPath, morgan('combined', { stream: logStream }), routerHandler);
}
