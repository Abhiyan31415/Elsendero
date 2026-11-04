# Gantabya

Gantabya is a travel companion app designed to enhance group trips and city-to-city travel. It provides features such as live location sharing, real-time step tracking, and in-app chat for seamless coordination and safety.

## Features
-In-App Chat with Reddit-like Threads: Communicate effortlessly within the app using threaded discussions for better organization.

-Trail Definition: Define and share travel trails with your group.

-Weather Tracking: Stay informed about weather conditions in your destination.

-Facility Tracking Using OpenStreetMap (OSM): Locate nearby facilities and points of interest with accurate OSM integration.

## Tech stack

- **Frontend** (`frontend/`): React 18 + Vite, MUI, Mapbox GL (react-map-gl), Socket.IO client
- **Backend** (`server/`): Node.js + Express, MongoDB (Mongoose), Socket.IO, JWT auth, Multer image uploads

## Requirements

- Node.js 20 (LTS) and npm
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Mapbox](https://account.mapbox.com/access-tokens/) public access token

## Local development

### 1. Backend

```bash
cd server
cp .env.example .env      # then fill in MONGO_CONNECT and JWT_SECRET
npm install
npm run dev               # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env      # set VITE_MAPBOX_TOKEN; VITE_API_URL defaults to http://localhost:5000
npm install
npm run dev               # http://localhost:5173
```

## Environment variables

### Backend (`server/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_CONNECT` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Long random string used to sign login tokens |
| `JWT_EXPIRES_IN` | no | Token lifetime, e.g. `7d` (default `7d`) |
| `CLIENT_URL` | yes (prod) | Comma-separated frontend origins allowed by CORS / Socket.IO, e.g. `https://your-site.netlify.app` (default `http://localhost:5173`) |
| `PORT` | no | Port to listen on (default `5000`; set automatically by Render) |

### Frontend (`frontend/.env` locally, Netlify environment variables in production)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | yes (prod) | Backend base URL, no trailing slash, e.g. `https://elsendero-server.onrender.com` (default `http://localhost:5000`) |
| `VITE_MAPBOX_TOKEN` | yes | Public Mapbox token (`pk.…`). Restrict it to your domains in the Mapbox dashboard |

`VITE_*` variables are baked into the bundle at build time, so redeploy the frontend after changing them. Never put secrets in them.

## Production deployment

The frontend and backend are deployed separately.

### Backend — Render (recommended)

1. In Render, choose **New → Blueprint** and point it at this repository. It picks up `render.yaml` at the repo root (service rooted at `server/`, health check at `/health`).
2. Set `MONGO_CONNECT` and `CLIENT_URL` (your Netlify URL, e.g. `https://your-site.netlify.app`). `JWT_SECRET` is generated automatically.
3. **Uploaded images are stored on the server's local disk (`server/uploads`).** Render's filesystem is ephemeral, so attach a [persistent disk](https://render.com/docs/disks) mounted at the service's `uploads` directory (e.g. `/opt/render/project/src/server/uploads`), otherwise all uploaded images are lost on every redeploy/restart. (Persistent disks require a paid Render plan.)

#### Alternative — Docker

```bash
cd server
docker build -t elsendero-server .
docker run -p 5000:5000 --env-file .env -v elsendero-uploads:/app/uploads elsendero-server
```

Mount a volume at `/app/uploads` so uploaded images survive container restarts.

### Frontend — Netlify

1. Create a new Netlify site from this repository. `netlify.toml` at the repo root already sets base `frontend`, build command `npm run build`, publish dir `dist`, Node 20, the SPA fallback and security/caching headers.
2. Under **Site configuration → Environment variables**, set `VITE_API_URL` (your backend URL) and `VITE_MAPBOX_TOKEN`.
3. Deploy, then make sure the backend's `CLIENT_URL` includes the Netlify URL (and any custom domain) so CORS and Socket.IO accept requests.

## Usage
1. Launch the app on your local browser.
2. Log in or sign up using your credentials.
3. Create or join a trip group.
4. Use the features to coordinate with your group and track your progress.

## Contributing
We welcome contributions to Gantabya! If you have any ideas or suggestions, feel free to:
- Fork the repository.
- Create a new branch.
- Submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

---

Happy travels with Gantabya!

https://github.com/user-attachments/assets/fbbb3edc-397b-421f-961c-1315e499b2cd
