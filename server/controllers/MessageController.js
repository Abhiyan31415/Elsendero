// controllers/messageController.js
import Message from '../models/Message.js';

// Get the latest 50 messages
export const getMessages = async (req, res) => {
    const { eventId } = req.query; // Pass eventId as a query parameter
    try {
        const messages = await Message.find({ eventId }).sort({ timestamp: 1 }).limit(50);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: "Unable to retrieve messages" });
    }
};


// Create a new message
export const createMessage = async (req, res) => {
    const { userId, username, content, eventId } = req.body;

    if (!eventId) {
        return res.status(400).json({ error: "Event ID is required" });
    }

    try {
        const message = new Message({ userId, username, content, eventId });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: "Unable to save message" });
    }
};

