import { verifyToken } from '../utils/token.js';

const NOT_AUTHORIZED = 'Not authorized, please log in again';

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (typeof header !== 'string') {
    return res.status(401).json({ success: false, message: NOT_AUTHORIZED });
  }
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: NOT_AUTHORIZED });
  }
  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ success: false, message: NOT_AUTHORIZED });
  }
};

export default auth;
