import { Event } from '../models/Event.js';  // Using named import

// Add a new event
const createEvent = async (req, res) => {
  const { title, description, from, to, location, participants } = req.body;

  try {
    const newEvent = new Event({
      title,
      description,
      from,
      to,
      location,
      participants,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: 'Error creating event' });
  }
};

// Get all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
};

// Default export
export default { createEvent, getEvents };
