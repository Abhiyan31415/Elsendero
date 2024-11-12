// controllers/messageController.js
import Message from '../models/Message.js';

// Get the latest 50 messages
export const getMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
        res.status(200).json(messages.reverse()); // reverse to show in chronological order
    } catch (error) {
        res.status(500).json({ error: "Unable to retrieve messages" });
    }
};

// Create a new message
export const createMessage = async (req, res) => {
    const { userId, username, content } = req.body;

    if (!userId || !username || !content) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const newMessage = new Message({ userId, username, content });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: "Failed to save message" });
    }
};
