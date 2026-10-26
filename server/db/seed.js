// Fills the database with dummy data. Run with: npm run seed
// Safe to re-run: it only seeds when the tables are empty.
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool, migrate } from './index.js';

dotenv.config();

const img = (id) => [[`https://images.unsplash.com/${id}?w=800&q=70`]];

async function seed() {
  await migrate();
  const { rows: [{ count }] } = await pool.query('SELECT count(*)::int FROM users');
  if (count > 0) {
    console.log('Database already has data, skipping seed.');
    return;
  }

  const password = await bcrypt.hash('password123', 12);
  const users = [
    ['Demo User', 'demo@elsendero.app', 'https://randomuser.me/api/portraits/men/3.jpg'],
    ['Sita Gurung', 'sita@example.com', 'https://randomuser.me/api/portraits/women/2.jpg'],
    ['Ramesh Thapa', 'ramesh@example.com', 'https://randomuser.me/api/portraits/men/5.jpg'],
  ];
  const ids = [];
  for (const [name, email, photo] of users) {
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password, photo_url) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, password, photo],
    );
    ids.push(rows[0].id);
  }

  const trails = [
    {
      title: 'Kathmandu to Nagarkot sunrise ride',
      description: 'Short drive up to Nagarkot for the Himalayan sunrise, with a tea stop in Bhaktapur.',
      sloc: [85.324, 27.7172], floc: [85.5206, 27.7154],
      checkp: [[85.4298, 27.671, 'Bhaktapur Durbar Square']],
      price: 1500, images: img('photo-1544735716-392fe2489ffa'), u: 0,
    },
    {
      title: 'Pokhara lakeside to Sarangkot',
      description: 'Easy morning hike from Lakeside up to Sarangkot viewpoint. Paragliders everywhere.',
      sloc: [83.9595, 28.2096], floc: [83.9433, 28.2441],
      checkp: [], price: 500, images: img('photo-1605640840605-14ac1855827b'), u: 1,
    },
    {
      title: 'Kathmandu to Chitwan jungle trip',
      description: 'Highway trip down to Sauraha for a jeep safari in Chitwan National Park.',
      sloc: [85.324, 27.7172], floc: [84.4885, 27.5781],
      checkp: [[84.8567, 27.7006, 'Mugling lunch stop']],
      price: 6000, images: img('photo-1585016495481-91613a3ab1bc'), u: 2,
    },
    {
      title: 'Lalitpur heritage walk',
      description: 'Walk from Patan Durbar Square through the old courtyards to the Golden Temple.',
      sloc: [85.3253, 27.6727], floc: [85.3249, 27.6766],
      checkp: [[85.3236, 27.6745, 'Kumbheshwar Temple']],
      price: 0, images: img('photo-1558799401-1dcba79834c2'), u: 0,
    },
  ];
  for (const t of trails) {
    const u = t.u;
    await pool.query(
      `INSERT INTO trails (sloc, floc, checkp, price, title, description, images, uid, u_name, u_photo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [JSON.stringify(t.sloc), JSON.stringify(t.floc), JSON.stringify(t.checkp), t.price,
        t.title, t.description, JSON.stringify(t.images), String(ids[u]), users[u][0], users[u][2]],
    );
  }

  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const { rows: events } = await pool.query(
    `INSERT INTO events (title, description, from_date, to_date, location, participants) VALUES
     ($1, $2, $3, $4, $5, $6), ($7, $8, $9, $10, $11, $12) RETURNING id`,
    [
      'Weekend Nagarkot trip', 'Leaving Saturday 5 AM, back Sunday evening.',
      new Date(now + 5 * day), new Date(now + 6 * day), 'Nagarkot', ['Demo User', 'Sita Gurung'],
      'Chitwan safari', 'Three days in Sauraha. Bring sunscreen.',
      new Date(now + 20 * day), new Date(now + 23 * day), 'Chitwan', ['Ramesh Thapa', 'Demo User'],
    ],
  );

  const chat = [
    [ids[0], 'Demo User', 'Who is bringing the car?'],
    [ids[1], 'Sita Gurung', 'I can drive, there is space for three more.'],
    [ids[0], 'Demo User', 'Perfect, see you at 5!'],
  ];
  for (const [uid, name, content] of chat) {
    await pool.query(
      'INSERT INTO messages (event_id, user_id, username, content) VALUES ($1, $2, $3, $4)',
      [String(events[0].id), String(uid), name, content],
    );
  }
  console.log('Seeded dummy data. Demo login: demo@elsendero.app / password123');
}

seed()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => pool.end());
