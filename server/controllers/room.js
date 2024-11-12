import tryCatch from "./utils/tryCatch.js";
import Trail from "../models/trail.js";
export const createRoom=tryCatch( async (req,res)=>{
    const {id:uid,name:uName,photoURL:uPhoto}=req.user;
    const newTrail=new Trail({...req.body,uid,uName,uPhoto});
    await newTrail.save()
    res.status(201).json({success:true,result:newTrail});


});