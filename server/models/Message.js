import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    eventId: { type: String, required: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
