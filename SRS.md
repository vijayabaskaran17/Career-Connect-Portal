# Software Requirements Specification — Career Connect

## 1. Introduction

### 1.1 Purpose
Career Connect is a web-based recruitment portal that streamlines job discovery for
students and applicant management for recruiters, with administrative oversight by a
placement cell. This document specifies its functional and non-functional requirements,
modular architecture, and database schema.

### 1.2 Scope
The system supports three user roles — Student, Recruiter, Admin — operating through a
single React SPA backed by a Node/Express REST API and a MongoDB database.

### 1.3 Intended Users
- Students/job-seekers searching for jobs and internships
- Recruiters posting openings and managing applicants
- Placement cell / admin staff overseeing recruiter legitimacy and platform metrics

## 2. Overall Description

### 2.1 Product Perspective
Standalone MERN web application, no dependency on external institutional systems.

### 2.2 User Classes
| Class | Description |
|---|---|
| Student | Default role on registration; manages profile and applications |
| Recruiter | Registers with company details; requires admin approval before posting jobs |
| Admin | Seeded/manually elevated account; approves recruiters, views analytics |

## 3. Functional Requirements

### FR-1 Authentication & Authorization
- FR-1.1: Users register with name, email, password, and role (student/recruiter)
- FR-1.2: Passwords stored using bcrypt hashing, never in plaintext
- FR-1.3: Login issues a signed JWT (7-day expiry) used to authenticate subsequent requests
- FR-1.4: Role-based middleware restricts endpoints (e.g., only recruiters can post jobs)

### FR-2 Student Module
- FR-2.1: Student can edit profile: skills, resume URL, education
- FR-2.2: Student can browse jobs with keyword search, location and job-type filters, and pagination
- FR-2.3: Student can view full job details and submit an application with an optional cover note
- FR-2.4: System prevents duplicate applications to the same job (enforced at DB level)
- FR-2.5: Student can view all their applications and current status

### FR-3 Recruiter Module
- FR-3.1: Recruiter account is flagged `isApproved: false` until admin approval
- FR-3.2: Approved recruiters can create, edit, and delete job postings
- FR-3.3: Recruiter can view a list of applicants per job with their profile/skills/resume
- FR-3.4: Recruiter can update an applicant's status: pending → shortlisted/rejected/selected

### FR-4 Admin Module
- FR-4.1: Admin can view all recruiters pending approval and approve them
- FR-4.2: Admin can view platform statistics: total students, recruiters, jobs, applications, placements

## 4. Non-Functional Requirements
- **Security:** JWT-based stateless auth, bcrypt hashing, role-guard middleware, input validation on registration
- **Scalability:** Stateless API design allows horizontal scaling of the Node server independent of the database
- **Usability:** Responsive card/table-based UI, clear status badges, pagination on large lists
- **Maintainability:** Clear separation of concerns (routes → controllers → models) for ease of extension

## 5. Modular Structure

1. **Auth Module** — registration, login, JWT issuance, current-user lookup
2. **Job Module** — CRUD for postings, public search/filter/pagination
3. **Application Module** — apply, track, review, status transitions
4. **User/Admin Module** — profile management, recruiter approval, analytics

## 6. Database Schema

### User
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique |
| password | String | required, bcrypt-hashed |
| role | Enum | student / recruiter / admin |
| skills | [String] | student only |
| resumeUrl | String | student only |
| education | String | student only |
| company | String | recruiter only |
| isApproved | Boolean | defaults true for student/admin, false for recruiter |
| savedJobs | [ObjectId → Job] | optional bookmarking |

### Job
| Field | Type | Notes |
|---|---|---|
| title | String | required |
| description | String | required |
| company | String | required |
| recruiter | ObjectId → User | required |
| skillsRequired | [String] | text-indexed |
| location | String | default "Remote" |
| jobType | Enum | Full-time/Part-time/Internship/Contract |
| salaryRange | String | free text |
| deadline | Date | optional |
| status | Enum | open / closed |

### Application
| Field | Type | Notes |
|---|---|---|
| job | ObjectId → Job | required |
| student | ObjectId → User | required |
| status | Enum | pending/shortlisted/rejected/selected |
| resumeSnapshot | String | copied at time of application |
| coverNote | String | optional |

Compound unique index on `(job, student)` prevents duplicate applications.

## 7. Use Case Summary

1. Student registers → completes profile → searches jobs → applies → tracks status
2. Recruiter registers → awaits approval → posts job → reviews applicants → updates status
3. Admin logs in → approves pending recruiters → monitors platform stats

## 8. Future Extensions
- Email notifications on status change
- Resume file upload (currently URL-based) via cloud storage (S3/Cloudinary)
- Interview scheduling calendar integration
