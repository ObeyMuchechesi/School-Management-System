# School Management System

A full stack school administration demo with an Express and MongoDB API and a React frontend.

## Included features

- Role based access for administrators, accounts staff, teachers, students, guardians, and staff
- Student, teacher, guardian, class, attendance, timetable, fee, exam, notice, and progress records
- Guardian views scoped to linked children
- School settings and bell schedule
- JWT authentication with hashed passwords

## Requirements

- Node.js 18 or newer
- A MongoDB Atlas database or local MongoDB instance

## Setup

1. In the backend folder, copy .env.example to .env and set MONGO_URI and a long random JWT_SECRET. The local .env is ignored by Git.
2. Install and start the API from backend: npm install, then npm run dev.
3. In a second terminal, install and start the web app from frontend: npm install, then npm run dev.
4. For local demo data, inspect backend/seed.js and run node seed.js from backend against an empty development database. The script clears its demo collections before inserting sample data.

The seed script creates these development-only accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@school.com | admin123 |
| Accounts | accounts@school.com | accounts123 |
| Teacher | teacher@school.com | teacher123 |
| Student | student@school.com | student123 |
| Guardian | parent@school.com | parent123 |

Change or remove these accounts before using the application with real school data.

The API listens on port 5001 by default. Vite serves the frontend on its development port and proxies /api requests to the API.

## Production

Set environment variables through the hosting provider's secret manager. Do not deploy a development .env file or use the seed accounts in production. Build the frontend with npm run build from frontend, then serve the generated frontend/dist directory through a static host or reverse proxy.
