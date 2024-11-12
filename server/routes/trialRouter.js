import {Router} from 'express';
import {postTrail} from '../controllers/trail.js';
const trialRouter=Router();
trialRouter.post('/',postTrail);
export default trialRouter;