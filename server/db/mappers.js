// Turn database rows into the JSON shape the frontend was built for
// (it was written against MongoDB, so it expects `_id` and camelCase fields).

export const toUser = (r) => r && ({
  _id: String(r.id), id: String(r.id),
  name: r.name, email: r.email, password: r.password, photoURL: r.photo_url,
});

export const toTrail = (r) => r && ({
  _id: String(r.id), id: String(r.id),
  sloc: r.sloc, floc: r.floc, checkp: r.checkp,
  price: Number(r.price), title: r.title, description: r.description,
  images: r.images, difficulty: r.difficulty,
  uid: r.uid, uName: r.u_name, uPhoto: r.u_photo,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

export const toEvent = (r) => r && ({
  _id: String(r.id), id: String(r.id),
  title: r.title, description: r.description,
  from: r.from_date, to: r.to_date,
  location: r.location, participants: r.participants,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

export const toMessage = (r) => r && ({
  _id: String(r.id), id: String(r.id),
  eventId: r.event_id, userId: r.user_id,
  username: r.username, content: r.content, timestamp: r.timestamp,
});
