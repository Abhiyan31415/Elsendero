import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import tryCatch from './utils/tryCatch.js'
export const register = tryCatch(async(req,res)=>{
   
        const {name,email,password}=req.body;
        if(password.length<6){
            return res.status(400).json({success:false,message:'Password must be at least 6 characters long'});
        }
        const emailLowerCase=email.toLowerCase();
        const existedUser=await User.findOne({email:emailLowerCase});
        if(existedUser){
            return res.status(400).json({success:false,message:'Email already exists'});
        }
        const hashedPassword=await bcrypt.hash(password,12);
        const user=await User.create({name,email:emailLowerCase,password:hashedPassword});
        const {_id:id,photoURL}=user;
        const token=jwt.sign({id,name,photoURL},process.env.JWT_SECRET,{expiresIn:'1d'});
        res.status(201).json({success:true,result:{id,name,email:user.email,photoURL,token}});
    
   
});
export const login=tryCatch(async(req,res)=>{
    const {email,password}=req.body;
        
        const emailLowerCase=email.toLowerCase();
        const existedUser=await User.findOne({email:emailLowerCase});
        if(!existedUser){
            return res.status(400).json({success:false,message:'User doesnt exists'});
        }
        const correctPassword=await bcrypt.compare(password,existedUser.password);
        if(!correctPassword){
            return res.status(400).json({success:false,message:'Password is incorrect'});
        }
        
        const {_id:id,name,photoURL}=existedUser;
        const token=jwt.sign({id,name,photoURL},process.env.JWT_SECRET,{expiresIn:'1d'});
        res.status(201).json({success:true,result:{id,name,email:emailLowerCase,photoURL,token}});
    
});
export const updateProfile=tryCatch(async(req,res)=>{
    const updatedUser=await User.findByIdAndUpdate(req.user.id,reqbody,{new:true})
    const {_id:id,name,email,photoURL}=updatedUser;


    //todo update a;; the rooms record added by user
    const token=jwt.sign({id,name,photoURL},process.env.JWT_SECRET,{expiresIn:'1d'});   
    res.status(200).json({success:true,result:{name,photoURL,token}}); 
});