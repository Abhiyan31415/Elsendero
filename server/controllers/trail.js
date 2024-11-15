import Trail from '../models/trail.js';

export const postTrail = async (req, res) => {
   
    try {
        const {currentUser,sloc,floc,checkp,price,title,description,difficulty,images} = req.body;
       console.log(images)
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
            difficulty:difficulty
        });
        await trail.save();
        res.status(201).json({success: true, result: trail});
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
    

}
export const getTrails = async (req, res) => {
    try {
        const trails = await Trail.find().sort({id:-1});
        res.status(200).json({success: true, result: trails});
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
}