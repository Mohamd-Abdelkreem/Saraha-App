import { hash, compare } from 'bcrypt';

export const hashPassword = async ({
  plainText = '',
  saltRounds = '',
}) => {
  return hash(plainText, parseInt(saltRounds));
};

export const compareHash = async ({
  plainText = '',
  hashedText = '',
}) => {
  return compare(plainText, hashedText);
};
