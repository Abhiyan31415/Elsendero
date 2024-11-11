import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';

import roomRouter from './routes/roomRouter.js';
import userRouter from './routes/userRouter.js';
import messageRouter from './routes/messageRouter.js';
import Message from './models/Message.js';

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Middleware to parse JSON data
app.use(express.json({ limit: '10mb' }));

// Set up CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
    next();
});

// Route setup
app.use('/messages', messageRouter);
app.use('/room', roomRouter);
app.use('/user', userRouter);
app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
});
app.use((req, res) => {
    res.status(404).json({ message: 'Page not found' });
});


io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("chat message", async (msg) => {
        const message = new Message({
            userId: msg.userId,
            username: msg.username,
            content: msg.content
        });
        await message.save();

        io.emit("chat message", msg); // Broadcast to all clients
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});


app.get("/messages", async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 }).limit(50); // Retrieve last 50 messages
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: "Unable to retrieve messages" });
    }
});


const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_CONNECT, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        server.listen(port, () => console.log(`Server is running on port ${port}`));
    } catch (error) {
        console.log("Failed to start server:", error);
    }
};

startServer();
