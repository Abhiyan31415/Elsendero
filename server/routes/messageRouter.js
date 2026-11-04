import express from 'express';
import { getMessages, createMessage } from '../controllers/MessageController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getMessages); // Get the latest messages
router.post('/', auth, createMessage); // Post a new message (auth required)

export default router;
