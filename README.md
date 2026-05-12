# Kerala Ayalkootam Manager

A full-stack web application for managing a Kerala Ayalkootam / Kudumbashree neighborhood group with one admin and exactly 20 fixed members.

The app supports weekly thrift collection, online payment approval, interest-free loans, member withdrawals, passbook history, PDF/CSV reports, backup/restore, and Malayalam-friendly UI.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Recharts
- Backend: Node.js, Express.js, MongoDB Atlas / MongoDB
- Auth: JWT, bcrypt password hashing, role-based access
- Reports: PDF and CSV export
- Database: MongoDB collections for members, users, transactions, loans, withdrawals, collections, and payment settings

## Main Features

- Admin login and member login
- 20 predefined member accounts
- Admin can edit member profile, username, and password
- Admin records weekly thrift collection
- Members can pay online using Google Pay / UPI details shown in the dashboard
- Members submit online payment reference for approval
- Admin approves online collection payments before they are added to total thrift
- Interest-free loan request and approval system
- Members can request withdrawal from their collection balance
- Admin approves or rejects withdrawal requests
- Member passbook with transaction history
- Premium responsive dashboard for desktop and mobile
- PDF and CSV reports
- Backup and restore
- MongoDB Atlas ready

## Workflow

1. Admin seeds the database with one admin and 20 members.
2. Admin logs in and manages member profiles.
3. Admin records weekly meeting collection manually.
4. Admin can add Google Pay number, UPI ID, QR image URL, and payment note.
5. Members log in and see the online payment details.
6. After paying online, members submit amount and transaction reference.
7. Admin approves online collection requests.
8. Approved online collections become thrift transactions and update total collection.
9. Members can request interest-free loans.
10. Admin approves or rejects loan requests.
11. Members can request withdrawal from their balance.
12. Admin approves withdrawal requests, which deduct from member balance.
13. Admin downloads PDF/CSV reports or backup JSON.

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
    .env.example
    package.json
  frontend/
    src/
      api/
      components/
      context/
      pages/
      App.jsx
      main.jsx
      index.css
    .env.example
    package.json
  package.json
  README.md
```

## Local Setup

Install dependencies:

```bash
npm run install:all
```

Create backend environment file:

```bash
cp backend/.env.example backend/.env
```

Example backend `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/ayalkootam?retryWrites=true&w=majority
JWT_SECRET=change-this-to-a-long-random-secret
CLIENT_URL=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

Create frontend environment file:

```bash
cp frontend/.env.example frontend/.env
```

Example frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Seed the database:

```bash
npm run seed
```

Start the app:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

## Demo Login

Admin:

```text
username: admin
password: admin123
```

Members:

```text
username: member1 to member20
password: password1 to password20
```

## MongoDB Atlas Notes

If using MongoDB Atlas:

1. Create a free cluster.
2. Create a database user.
3. Add your IP address in Network Access.
4. Use database name `ayalkootam` in the connection string.
5. If local login fails, run `npm run seed` again after MongoDB connects.

## Deployment

### Backend on Render

1. Create a new Web Service.
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add backend environment variables.
6. Set `CLIENT_URL` to the frontend deployed URL.

### Frontend on Vercel or Netlify

1. Root directory: `frontend`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add:

```env
VITE_API_URL=https://your-backend-url/api
```

## GitHub Push Process Used

The project was pushed to GitHub with:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/rishad3855/kerala-ayalkootam-manager.git
git push -u origin main --force
```

The `.gitignore` prevents secrets and heavy generated files from being pushed, including:

```text
.env
node_modules
dist
.npm-cache
```

## Important Security Notes

- Do not commit `.env` files.
- Change the MongoDB Atlas password before production.
- Change `JWT_SECRET` before deployment.
- Keep the admin password private.

