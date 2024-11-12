import Trail from '../models/trail.js';

export const postTrail = async (req, res) => {
   
    try {
        const {currentUser,sloc,floc,checkp,price,title,description,images} = req.body;
        const trail = new Trail({
            sloc: sloc,
            floc: floc,
            checkp: checkp,
            price: price,
            title: title,
            description: description,
            images: images,
            uid: currentUser.id,
            uName: currentUser.name,
            uPhoto: currentUser.photoURL,
        });
        await trail.save();
        res.status(201).json({success: true, result: trail});
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
    

}