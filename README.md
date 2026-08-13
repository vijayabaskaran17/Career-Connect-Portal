# Career Connect — MERN Stack Job Portal

A full-stack recruitment platform connecting **Students**, **Recruiters**, and an **Admin
(placement cell)**. Built with MongoDB, Express.js, React.js, and Node.js.

## 1. Problem Statement

Students struggle to find job/internship opportunities matched to their skills, while
recruiters lack an efficient way to reach and filter genuine candidates. Career Connect
centralizes job postings, applications, and candidate tracking in one platform, with an
admin layer for recruiter verification and placement analytics.

## 2. Actors & Roles

| Role | Capabilities |
|---|---|
| **Student** | Register/login, build profile (skills, resume link, education), browse & search jobs, apply, track application status |
| **Recruiter** | Register (pending admin approval), post/edit/delete jobs, view applicants, update application status (shortlist/reject/select) |
| **Admin** | Approve recruiter accounts, view platform-wide stats (students, recruiters, jobs, applications, placements) |

## 3. Tech Stack

- **Frontend:** React 18, React Router v6, Context API for auth state, Axios
- **Backend:** Node.js, Express.js, JWT auth, bcrypt password hashing, express-validator
- **Database:** MongoDB with Mongoose ODM

## 4. Database Schema (Mongoose Models)

**User** — name, email, password (hashed), role (student/recruiter/admin), skills[],
resumeUrl, education, company, isApproved, savedJobs[]

**Job** — title, description, company, recruiter (ref User), skillsRequired[], location,
jobType, salaryRange, deadline, status (open/closed) — text-indexed for search

**Application** — job (ref Job), student (ref User), status (pending/shortlisted/rejected/selected),
resumeSnapshot, coverNote — unique compound index on (job, student) prevents duplicate applications

## 5. Folder Structure

```
career-connect/
├── server/                # Express + MongoDB API
│   ├── config/db.js
│   ├── models/            # User, Job, Application
│   ├── middleware/        # auth (JWT + role guard), errorHandler
│   ├── controllers/       # authController, jobController, applicationController, userController
│   ├── routes/            # authRoutes, jobRoutes, applicationRoutes, userRoutes
│   ├── seed.js            # creates a default admin account
│   └── server.js          # app entry point
└── client/                # React SPA
    └── src/
        ├── api/axios.js           # axios instance with JWT interceptor
        ├── context/AuthContext.js # global auth state (Context API)
        ├── components/            # Navbar, JobCard, ProtectedRoute, ApplicationTable
        └── pages/                 # Login, Register, JobList, JobDetail, Dashboard, PostJob, Applicants, Profile
```

## 6. API Endpoints

| Method | Route | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register user (student/recruiter) |
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/auth/me | Private | Get current user |
| GET | /api/jobs | Public | List jobs (search, filter, pagination) |
| GET | /api/jobs/:id | Public | Job detail |
| POST | /api/jobs | Recruiter | Create job |
| PUT | /api/jobs/:id | Recruiter (owner) | Update job |
| DELETE | /api/jobs/:id | Recruiter (owner) | Delete job |
| GET | /api/jobs/recruiter/mine | Recruiter | Recruiter's own postings |
| POST | /api/applications | Student | Apply to a job |
| GET | /api/applications/mine | Student | Student's own applications |
| GET | /api/applications/job/:jobId | Recruiter (owner) | View applicants for a job |
| PUT | /api/applications/:id/status | Recruiter (owner) | Update applicant status |
| PUT | /api/users/profile | Private | Update own profile |
| GET | /api/users/pending-recruiters | Admin | List unapproved recruiters |
| PUT | /api/users/:id/approve | Admin | Approve a recruiter |
| GET | /api/users/stats | Admin | Platform-wide statistics |

## 7. Local Setup

### Backend
```bash
cd server
npm install
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm run dev                # requires nodemon (npm i -D nodemon), or: npm start
node seed.js                # optional: creates admin@careerconnect.com / Admin@123
```

### Frontend
```bash
cd client
npm install
cp .env.example .env      # set REACT_APP_API_URL if backend isn't on localhost:5000
npm start
```

App runs at `http://localhost:3000`, API at `http://localhost:5000/api`.

## 8. Cloud Deployment

1. **Database:** Create a free MongoDB Atlas cluster → whitelist `0.0.0.0/0` (or your
   deployment platform's IPs) → copy the connection string into `MONGO_URI`.
2. **Backend:** Deploy the `server/` folder to **Render** or **Railway**:
   - Build command: `npm install`
   - Start command: `npm start`
   - Set environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your frontend's deployed URL)
3. **Frontend:** Deploy the `client/` folder to **Vercel** or **Netlify**:
   - Build command: `npm run build`, output directory: `build`
   - Set `REACT_APP_API_URL` to your deployed backend's `/api` URL
4. Update backend's `CLIENT_URL` env var to match the deployed frontend origin (for CORS).

## 9. GitHub Workflow (for team submission)

- `main` branch protected; feature branches per module (`feature/auth`, `feature/jobs`,
  `feature/applications`, `feature/admin-dashboard`)
- Pull requests with at least one reviewer before merging
- Commit history should reflect each member's contribution across backend/frontend/schema work

## 10. Default Test Accounts (after running seed.js)

- Admin: `admin@careerconnect.com` / `Admin@123`
- Create a recruiter and student via the Register page to test the full flow
  (recruiter accounts need admin approval before they can post jobs — approve via
  the Admin Dashboard's "Pending Recruiter Approvals" table)

> Recruiter accounts must be approved by an Admin (via the Admin Dashboard) before they
> can post jobs — enforced server-side in `jobController.createJob`.
