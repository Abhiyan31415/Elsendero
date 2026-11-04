import { Event } from '../models/Event.js'; // Using named import

// Add a new event (requires auth; creator taken from req.user)
const createEvent = async (req, res) => {
  const { title, description, from, to, location, participants } = req.body || {};

  try {
    const newEvent = new Event({
      title,
      description,
      from,
      to,
      location,
      participants,
      createdBy: req.user.id,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    if (error?.name === 'ValidationError' || error?.name === 'CastError') {
      return res.status(400).json({ success: false, error: error.message, message: error.message });
    }
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, error: 'Error creating event', message: 'Error creating event' });
  }
};

// Get all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ from: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, error: 'Error fetching events', message: 'Error fetching events' });
  }
};

export default { createEvent, getEvents };
