import { Router } from 'express';
import { postTrail, getTrails } from '../controllers/trail.js';
import auth from '../middleware/auth.js';

const trialRouter = Router();
trialRouter.post('/', auth, postTrail);
trialRouter.get('/', getTrails);
export default trialRouter;
