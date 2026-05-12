# Kerala Ayalkootam Manager

A production-ready starter for managing a Kerala Ayalkootam/Kudumbashree neighborhood group with one admin and exactly 20 fixed members.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Recharts
- Backend: Node.js, Express.js, MongoDB, JWT, bcrypt
- Reports: PDF, CSV
- Notifications: Nodemailer and Twilio placeholders, disabled until credentials are added

## Folder Structure

```text
kerala-ayalkootam-manager/
  backend/
    src/
      config/
      middleware/
      models/
      routes/
      scripts/
      utils/
      server.js
    package.json
    .env.example
  frontend/
    src/
      api/
      components/
      context/
      pages/
      App.jsx
      main.jsx
      index.css
    package.json
    .env.example
```

## Local Setup

1. Install MongoDB locally or create a free MongoDB Atlas database.
2. Copy `backend/.env.example` to `backend/.env`.
3. Copy `frontend/.env.example` to `frontend/.env`.
4. Install dependencies:

```bash
npm run install:all
```

5. Seed admin and 20 demo members:

```bash
npm run seed
```

6. Start both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`

## Demo Logins

Admin:

- Username: `admin`
- Password: `admin123`

Members:

- Username: `member1` to `member20`
- Password: `password1` to `password20`

## Deployment

### Backend on Render

1. Create a new Web Service.
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `backend/.env.example`.
6. Set `CLIENT_URL` to your deployed frontend URL.

### Frontend on Vercel or Netlify

1. Root directory: `frontend`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add `VITE_API_URL=https://your-backend-url.onrender.com/api`

## Notes for Local Groups

- The app keeps the member count fixed at 20 by default. Admins can edit member profiles but cannot create more than 20 active members.
- Members can record self-payments and request loans. Admins approve loans, record weekly thrift, repayments, and generate reports.
- PDF/CSV exports are available without paid services.
- Email/SMS reminders are optional and only run after free-tier SMTP/Twilio credentials are configured.
