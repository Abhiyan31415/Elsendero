import { query } from '../db/index.js';
import { toTrail } from '../db/mappers.js';

export async function insertTrail(t) {
  const { rows } = await query(
    `INSERT INTO trails (sloc, floc, checkp, price, title, description, images, difficulty, uid, u_name, u_photo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
    [
      JSON.stringify(t.sloc), JSON.stringify(t.floc), JSON.stringify(t.checkp ?? []),
      t.price ?? 0, t.title, t.description, JSON.stringify(t.images ?? []),
      t.difficulty ?? null, String(t.uid), t.uName, t.uPhoto ?? '',
    ],
  );
  return toTrail(rows[0]);
}

export const postTrail = async (req, res) => {
  try {
    const { currentUser, ...trail } = req.body;
    if (!currentUser?.id) {
      return res.status(401).json({ success: false, message: 'Please log in to add a trail' });
    }
    const result = await insertTrail({
      ...trail,
      uid: currentUser.id,
      uName: currentUser.name,
      uPhoto: currentUser.photoURL,
    });
    res.status(201).json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTrails = async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM trails ORDER BY id DESC');
    res.status(200).json({ success: true, result: rows.map(toTrail) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
