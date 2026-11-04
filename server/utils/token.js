import jwt from 'jsonwebtoken';

const JWT_EXPIRES_IN = () => process.env.JWT_EXPIRES_IN || '7d';

// Single place where auth tokens are created.
export const signToken = (user) => {
  const id = String(user._id ?? user.id);
  return jwt.sign(
    { id, name: user.name, photoURL: user.photoURL },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN() }
  );
};

// Returns { id, name, photoURL } or throws if invalid/expired.
export const verifyToken = (token) => {
  const { id, name, photoURL } = jwt.verify(token, process.env.JWT_SECRET);
  return { id, name, photoURL };
};
