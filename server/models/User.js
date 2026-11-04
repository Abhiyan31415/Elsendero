import mongoose, { Schema } from 'mongoose';

const defaultImages = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/men/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/men/4.jpg',
  'https://randomuser.me/api/portraits/men/5.jpg',
  'https://randomuser.me/api/portraits/men/6.jpg',
  'https://randomuser.me/api/portraits/women/1.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/women/3.jpg',
];

const randomDefaultImage = () =>
  defaultImages[Math.floor(Math.random() * defaultImages.length)];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 5,
      maxlength: 254,
    },
    password: { type: String, required: true, select: false },
    photoURL: { type: String, default: randomDefaultImage },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
