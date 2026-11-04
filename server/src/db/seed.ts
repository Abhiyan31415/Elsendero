// Dummy data for local development (see src/scripts/seed.ts).
// Only seeds when the users table is empty; returns whether it did.
import bcrypt from 'bcryptjs';
import { count } from 'drizzle-orm';
import type { Db } from './client.js';
import { events, messages, trails, users, type NewTrailRow } from './schema.js';

const img = (id: string): string[][] => [[`https://images.unsplash.com/${id}?w=800&q=70`]];
const DAY = 24 * 60 * 60 * 1000;

export async function seed(db: Db): Promise<boolean> {
  const [row] = await db.select({ n: count() }).from(users);
  if ((row?.n ?? 0) > 0) return false;

  const password = await bcrypt.hash('password123', 12);
  const people = [
    { name: 'Demo User', email: 'demo@elsendero.app', photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { name: 'Sita Gurung', email: 'sita@example.com', photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { name: 'Ramesh Thapa', email: 'ramesh@example.com', photoUrl: 'https://randomuser.me/api/portraits/men/5.jpg' },
  ] as const;
  const created = await db
    .insert(users)
    .values(people.map((p) => ({ ...p, password })))
    .returning();
  const by = (i: number) => {
    const u = created[i];
    if (!u) throw new Error('seed user missing');
    return { uid: String(u.id), uName: u.name, uPhoto: u.photoUrl };
  };

  const trailRows: NewTrailRow[] = [
    {
      title: 'Kathmandu to Nagarkot sunrise ride',
      description: 'Short drive up to Nagarkot for the Himalayan sunrise, with a tea stop in Bhaktapur.',
      sloc: [85.324, 27.7172],
      floc: [85.5206, 27.7154],
      checkp: [[85.4298, 27.671, 'Bhaktapur Durbar Square']],
      price: 1500,
      images: img('photo-1544735716-392fe2489ffa'),
      ...by(0),
    },
    {
      title: 'Pokhara lakeside to Sarangkot',
      description: 'Easy morning hike from Lakeside up to Sarangkot viewpoint. Paragliders everywhere.',
      sloc: [83.9595, 28.2096],
      floc: [83.9433, 28.2441],
      checkp: [],
      price: 500,
      images: img('photo-1605640840605-14ac1855827b'),
      ...by(1),
    },
    {
      title: 'Kathmandu to Chitwan jungle trip',
      description: 'Highway trip down to Sauraha for a jeep safari in Chitwan National Park.',
      sloc: [85.324, 27.7172],
      floc: [84.4885, 27.5781],
      checkp: [[84.8567, 27.7006, 'Mugling lunch stop']],
      price: 6000,
      images: img('photo-1585016495481-91613a3ab1bc'),
      ...by(2),
    },
    {
      title: 'Lalitpur heritage walk',
      description: 'Walk from Patan Durbar Square through the old courtyards to the Golden Temple.',
      sloc: [85.3253, 27.6727],
      floc: [85.3249, 27.6766],
      checkp: [[85.3236, 27.6745, 'Kumbheshwar Temple']],
      price: 0,
      images: img('photo-1558799401-1dcba79834c2'),
      ...by(0),
    },
  ];
  await db.insert(trails).values(trailRows);

  const now = Date.now();
  const [nagarkot] = await db
    .insert(events)
    .values([
      {
        title: 'Weekend Nagarkot trip',
        description: 'Leaving Saturday 5 AM, back Sunday evening.',
        fromDate: new Date(now + 5 * DAY),
        toDate: new Date(now + 6 * DAY),
        location: 'Nagarkot',
        participants: ['Demo User', 'Sita Gurung'],
        createdBy: by(0).uid,
      },
      {
        title: 'Chitwan safari',
        description: 'Three days in Sauraha. Bring sunscreen.',
        fromDate: new Date(now + 20 * DAY),
        toDate: new Date(now + 23 * DAY),
        location: 'Chitwan',
        participants: ['Ramesh Thapa', 'Demo User'],
        createdBy: by(2).uid,
      },
    ])
    .returning();
  if (!nagarkot) throw new Error('seed event missing');

  const chat: [number, string][] = [
    [0, 'Who is bringing the car?'],
    [1, 'I can drive, there is space for three more.'],
    [0, 'Perfect, see you at 5!'],
  ];
  for (const [i, content] of chat) {
    // Sequential so created_at ordering matches the conversation.
    await db.insert(messages).values({
      eventId: String(nagarkot.id),
      userId: by(i).uid,
      username: by(i).uName,
      content,
    });
  }
  return true;
}
