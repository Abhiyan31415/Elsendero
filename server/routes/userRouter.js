import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, updateProfile, me } from '../controllers/user.js';
import auth from '../middleware/auth.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later' },
});

const userRouter = Router();
userRouter.post('/register', authLimiter, register);
userRouter.post('/login', authLimiter, login);
userRouter.get('/me', auth, me);
userRouter.patch('/updateProfile', auth, updateProfile);
export default userRouter;
