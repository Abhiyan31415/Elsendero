import mongoose from 'mongoose';



const trailSchema = new mongoose.Schema({
    sloc:{type:[Number],required:true},
    floc:{type:[Number],required:true},
    checkp:{type:[[String]],required:false,default:[]},
    price:{type:Number,required:true,default:0},
    title:{type:String,required:true},
    description:{type:String,required:true},
    images:{type:[[String]],required:true,default:[]},
    uid:{type:String,required:true},
    uName:{type:String,required:true},
    uPhoto:{type:String,default:''},


},
{timestamps:true}
);
const Trail = mongoose.model('Trail',trailSchema);
export default Trail;