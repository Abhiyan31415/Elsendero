import express from 'express';
import eventController from '../controllers/EventController.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.post('/', auth, eventController.createEvent); // Add new event (auth required)
router.get('/', eventController.getEvents); // Get all events

export default router;
