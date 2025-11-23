import { roleEnum } from '../../DB/Models/user.model.js';

export const endPoint = {
  profile: [roleEnum.user, roleEnum.admin],
  restoreAccount: [roleEnum.admin],
  deleteAccount: [roleEnum.admin],
};
