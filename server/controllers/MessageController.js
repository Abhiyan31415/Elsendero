import Message from '../models/Message.js';

export const MAX_MESSAGE_LENGTH = 2000;

// GET /messages?eventId=... — latest 50 messages for an event (oldest first)
export const getMessages = async (req, res) => {
  const { eventId } = req.query;
  if (!eventId || typeof eventId !== 'string') {
    return res.status(400).json({ success: false, error: 'Event ID is required', message: 'Event ID is required' });
  }
  try {
    const messages = await Message.find({ eventId }).sort({ timestamp: -1 }).limit(50);
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unable to retrieve messages', message: 'Unable to retrieve messages' });
  }
};

// POST /messages — requires auth; author comes from the token
export const createMessage = async (req, res) => {
  const { content, eventId } = req.body || {};

  if (!eventId || typeof eventId !== 'string') {
    return res.status(400).json({ success: false, error: 'Event ID is required', message: 'Event ID is required' });
  }
  if (typeof content !== 'string' || !content.trim() || content.length > MAX_MESSAGE_LENGTH) {
    const msg = `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters`;
    return res.status(400).json({ success: false, error: msg, message: msg });
  }

  try {
    const message = new Message({
      userId: req.user.id,
      username: req.user.name,
      content: content.trim(),
      eventId,
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unable to save message', message: 'Unable to save message' });
  }
};
