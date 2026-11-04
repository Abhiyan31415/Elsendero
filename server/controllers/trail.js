import Trail from '../models/trail.js';

// Requires auth: creator is taken from the verified token (req.user), not the body.
export const postTrail = async (req, res) => {
  try {
    const { sloc, floc, checkp, price, title, description, images } = req.body || {};
    const { id, name, photoURL } = req.user;
    const trail = new Trail({
      sloc,
      floc,
      checkp,
      price,
      title,
      description,
      images,
      uid: id,
      uName: name,
      uPhoto: photoURL || '',
    });
    await trail.save();
    res.status(201).json({ success: true, result: trail });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTrails = async (req, res) => {
  try {
    const trails = await Trail.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, result: trails });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
