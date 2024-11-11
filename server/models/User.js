import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema({
    name:{type:String,min:2,max:50,required:true},
    email:{type:String,min:5,max:50,required:true,unique:true},
    password:{type:String,required:true},
    photoURL:{type:String,default:'https://via.placeholder.com/150'},


});
const User=mongoose.model('User',userSchema);
export default User;
