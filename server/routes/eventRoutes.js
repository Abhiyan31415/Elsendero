import express from 'express';

import eventController from '../controllers/EventController.js';
const router = express.Router();
router.post('/', eventController.createEvent); // Add new event
router.get('/', eventController.getEvents); // Get all events

export default router;
