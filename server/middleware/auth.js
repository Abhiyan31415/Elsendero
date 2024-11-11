import jwt from 'jsonwebtoken';


const auth = async (req, res, next) => {
    try{
        const decodedToken=jwt.verify(token,process.env.JWT_SECRET);
        const{id,name,photoURL}=decodedToken;
        req.user={id,name,photoURL};
    }catch(error){
        console.log(error)
    }
}