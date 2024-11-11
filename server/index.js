import express from 'express';
import dotenv from 'dotenv';
import roomRouter from './routes/roomRouter.js';
import mongoose from 'mongoose';
import userRouter from './routes/userRouter.js';

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

app.use(express.json({ limit: '10mb' }));

// CORS setup
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
    next();
});

app.use('/messages', messageRouter);
app.use('/room', roomRouter);
app.use('/user', userRouter); // Corrected path
app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
});
app.use((req, res) => {
    res.status(404).json({ message: 'Page not found' });
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("chat message", async (msg) => {
        const message = new Message(msg);
        await message.save();

        io.emit("chat message", message); // Broadcast to all clients
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

app.get("/messages", async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 }).limit(50);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: "Unable to retrieve messages" });
    }
});

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_CONNECT);
        app.listen(port, () => console.log(`Server is running on port ${port}`));
    } catch (error) {
        console.log(error);
    }
};

startServer();