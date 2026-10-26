import tryCatch from './utils/tryCatch.js';
import { insertTrail } from './trail.js';

export const createRoom = tryCatch(async (req, res) => {
  const { id: uid, name: uName, photoURL: uPhoto } = req.user;
  const result = await insertTrail({ ...req.body, uid, uName, uPhoto });
  res.status(201).json({ success: true, result });
});
