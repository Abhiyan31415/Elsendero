import { saveMessage, listMessages } from '../db/messages.js';

export const getMessages = async (req, res) => {
  const { eventId } = req.query;
  if (!eventId) return res.status(400).json({ error: 'Event ID is required' });
  try {
    res.json(await listMessages(eventId));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to retrieve messages' });
  }
};

export const createMessage = async (req, res) => {
  const { userId, username, content, eventId } = req.body;
  if (!eventId) return res.status(400).json({ error: 'Event ID is required' });
  try {
    res.status(201).json(await saveMessage({ userId, username, content, eventId }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to save message' });
  }
};
