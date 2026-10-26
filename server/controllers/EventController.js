import { query } from '../db/index.js';
import { toEvent } from '../db/mappers.js';

const createEvent = async (req, res) => {
  const { title, description, from, to, location, participants = [] } = req.body;
  try {
    const { rows } = await query(
      `INSERT INTO events (title, description, from_date, to_date, location, participants)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, from, to, location,
        participants.map((p) => String(p).trim()).filter(Boolean)],
    );
    res.status(201).json(toEvent(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating event' });
  }
};

const getEvents = async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM events ORDER BY from_date');
    res.status(200).json(rows.map(toEvent));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching events' });
  }
};

export default { createEvent, getEvents };
