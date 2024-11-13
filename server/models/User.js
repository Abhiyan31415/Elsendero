import mongoose from "mongoose";
import { Schema } from "mongoose";

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
const userSchema = new Schema({
    name:{type:String,min:2,max:50,required:true},
    email:{type:String,min:5,max:50,required:true,unique:true},
    password:{type:String,required:true},
    photoURL:{type:String,default:`${defaultImages[Math.floor(Math.random()*defaultImages.length)]}`},


});
const User=mongoose.model('User',userSchema);
export default User;
