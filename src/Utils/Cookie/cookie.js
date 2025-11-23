export const cookieConfig = ({
  res,
  cookieName = '',
  cookieValue = '',
  options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: process.env.COOKIE_EXPIRES_IN_MS,
    path: '/',
  },
}) => {
    res.cookie(cookieName, cookieValue, options);
};
