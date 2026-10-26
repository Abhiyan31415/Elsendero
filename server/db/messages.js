import { query } from './index.js';
import { toMessage } from './mappers.js';

export async function saveMessage({ eventId, userId, username, content }) {
  const { rows } = await query(
    `INSERT INTO messages (event_id, user_id, username, content)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [String(eventId), String(userId), username, content],
  );
  return toMessage(rows[0]);
}

// Latest 50 messages for an event, oldest first.
export async function listMessages(eventId) {
  const { rows } = await query(
    `SELECT * FROM (
       SELECT * FROM messages WHERE event_id = $1
       ORDER BY timestamp DESC LIMIT 50
     ) m ORDER BY timestamp ASC`,
    [String(eventId)],
  );
  return rows.map(toMessage);
}
