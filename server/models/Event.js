import mongoose from 'mongoose';


const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    location: { type: String, required: true },
    participants: { type: [String], default: [] }, // array of participant usernames
  },
  { timestamps: true }
);

// module.exports = mongoose.model('Event', eventSchema);
const Event = mongoose.model('Event', eventSchema);

// Named export
export { Event };
