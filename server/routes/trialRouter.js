import {Router} from 'express';
import {postTrail,getTrails} from '../controllers/trail.js';
const trialRouter=Router();
trialRouter.post('/',postTrail);
trialRouter.get('/',getTrails);
export default trialRouter;