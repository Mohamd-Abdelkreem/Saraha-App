import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths for encryption keys
const keysDir = path.join(__dirname, '../../Encryption Keys');
const publicKeyPath = path.join(keysDir, 'public.pem');
const privateKeyPath = path.join(keysDir, 'private.pem');

// Ensure the Encryption Keys directory exists
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

// ===================================SYMMETRIC ENCRYPTION===========================================
let cachedEncryptionKey;
const getEncryptionKey = () => {
  if (cachedEncryptionKey) return cachedEncryptionKey;

  const secret = process.env.ENCRYPTION_SECRET_KEY;

  if (!secret) {
    throw new Error('ENCRYPTION_SECRET_KEY environment variable is not set');
  }

  const keyBuffer = Buffer.from(secret);

  if (keyBuffer.length !== 32) {
    throw new Error('ENCRYPTION_SECRET_KEY must be 32 bytes for aes-256-cbc');
  }

  cachedEncryptionKey = keyBuffer;
  return cachedEncryptionKey;
};

export const encrypt = async (text) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', getEncryptionKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted + ':' + iv.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
};
export const decrypt = async (encryptedText) => {
  try {
    const [encrypted, ivHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      getEncryptionKey(),
      iv
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed: ' + (error.message || 'unknown error'));
  }
};

// ===================================ASYMMETRIC ENCRYPTION===========================================
if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath)) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });
  fs.writeFileSync(publicKeyPath, publicKey);
  fs.writeFileSync(privateKeyPath, privateKey);
  console.log('RSA key pair generated and stored in Encryption Keys folder');
}

export const asymmetricEncrypt = (text) => {
  const bufferedText = Buffer.from(text, 'utf8');
  const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    bufferedText
  );
  return encrypted.toString('hex');
};

export const asymmetricDecrypt = (encryptedText) => {
  const bufferedText = Buffer.from(encryptedText, 'hex');
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    bufferedText
  );
  return decrypted.toString('utf8');
};
