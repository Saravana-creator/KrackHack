# AEGIS PROTOCOL

## 1. Project Overview

**AEGIS PROTOCOL** is a unified digital infrastructure designed to bridge the gap between institutional administration, academic management, and student welfare.

In large educational institutions, critical processes like grievance redressal, academic resource sharing, and career opportunities are often fragmented across disjointed platforms or manual paperwork. AEGIS PROTOCOL solves this by integrating these verticals into a single, cohesive ecosystem.

This system replaces opaque bureaucratic silos with a transparent, role-based digital protocol. It matters because it restores trust through accountability—ensuring every grievance is tracked, every resource is accessible, and every opportunity is visible to the right people at the right time.

## 2. Core Pillars of AEGIS PROTOCOL

The system is built on five interconnected pillars, not isolated applications:

### 🎓 Academic Management
A centralized hub for the academic lifecycle. Faculty manage classes, enroll students, and distribute learning materials through the **Vault of Knowledge**. Students access a synchronized **Academic Calendar** and resources without clutter.

### 🚨 Grievance Redressal System
A robust tracking mechanism for student issues. It replaces "drop-box" complaints with a transparent digital timeline, escalating issues from submission to resolution with accountability at every step.

### 💼 Career & Opportunities Portal
A dedicated pipeline for professional growth. It aggregates internships, research projects, and job openings, allowing faculty to vet applications before they reach external partners.

### 🏛️ Authority & Governance Oversight
A high-level view for department heads and oversight committees. This pillar provides read-only access to grievance timelines and campus analytics, enabling data-driven decision-making without interfering in daily operations.

### 🛡️ Admin Control & System Integrity
The backbone of the protocol. Admins manage the digital campus layout—defining allowed domains, managing users, and overseeing system health—ensuring security and compliance.

## 3. Role-Based Architecture

AEGIS PROTOCOL is strictly role-driven. What you see depends entirely on who you are.

### 👨🎓 Student
*   **Dashboard:** Personalized view of active grievances, upcoming academic events, and recent opportunities.
*   **Academics:** Access to enrolled classes, the **Vault of Knowledge** (resources), and the **Academic Calendar**.
*   **Grievance:** Submission interface with categories, severity levels, and a real-time tracking timeline.
*   **Opportunities:** Browse and apply for verified internships and research positions.
*   **Notifications:** Real-time alerts for grievance updates and academic announcements.

### 🧑🏫 Faculty
*   **Class Management:** Create courses, enroll students, and manage rosters.
*   **Resource Hub:** Upload PDFs and materials to the **Vault of Knowledge**, organized by course.
*   **Opportunities:** Post research or internship openings and review student applications.
*   **Attendance:** Visualize attendance trends (privacy-safe, aggregated views).

### 🏛️ Authority
*   **Oversight:** Read-only access to all grievances to ensure fair handling.
*   **Lost & Found:** Oversight of campus lost property reports.
*   **Tracking:** Timeline-based view of how grievances are progressing.
*   **Analytics:** Filtered dashboards showing department-wise trends and resolution rates.

### 🛠️ Admin
*   **User Management:** Create, update, or block users; assign roles.
*   **System Control:** Define allowed email domains organization-wide.
*   **Analytics:** Full system-level visibility into user growth, engagement, and system health.
*   **Restriction:** Admins **cannot** read private grievance details unless escalated; their focus is infrastructure.

## 4. Key Features

*   **Role-Based Access Control (RBAC):** Strict JWT-enforced permissions for every route.
*   **Real-time Notifications:** Instant alerts via **Socket.io** for critical updates.
*   **Timeline-based Grievance Tracking:** Visual progress bars for transparency.
*   **Academic Calendar:** Centralized schedule for exams and deadlines.
*   **Vault of Knowledge:** Local, structured storage for academic resources (PDFs).
*   **Faculty Opportunity Pipeline:** Integrated application review system.
*   **Analytics Dashboards:** Data visualization for Authority and Admin roles.
*   **Attendance Inference:** Privacy-safe aggregation of student attendance data.

## 5. Tech Stack

| Component | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Redux Toolkit, Tailwind CSS, React Icons, Socket.io client |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), JWT Authentication, Socket.io |
| **Other** | REST APIs, RBAC middleware, Aggregation pipelines |

## 6. Folder Structure Overview

```
/client             # React Frontend
/server             # Node.js Backend
  ├── controllers   # Business logic (Academics, Grievance, etc.)
  ├── models        # Mongoose schemas (User, Course, Resource)
  ├── routes        # API endpoints
  ├── middleware    # Auth & RBAC protection
  ├── constants     # System-wide constants (Roles, Status)
  └── sockets       # Real-time event handlers
```

## 7. API Design Philosophy

*   **RESTful Principles:** Predictable resource-oriented URLs (e.g., `/api/v1/grievances`).
*   **Role-Guarded Routes:** Every endpoint verifies the JWT token and the user's role before executing logic.
*   **Read-Only Analytics:** Dedicated endpoints for aggregation pipelines that compute stats without exposing raw data.
*   **Separation of Concerns:** Controllers handle logic, services handle data, and middleware handles security.
*   **No Cross-Role Leakage:** API responses are filtered at the database level to ensure users never receive data unauthorized for their role.

## 8. Notifications System

The system accepts no lag in communication.
*   **Socket.io:** Used for instant, bi-directional communication.
*   **Hardcoded Triggers:** Events like "Grievance Status Update" or "New Resource Uploaded" trigger immediate alerts.
*   **Real-time + Persistence:** Notifications are pushed instantly to online users and persisted in MongoDB for offline users.
*   **Bell Icon UX:** A centralized notification center ensures updates are never missed.
*   **No Polling:** We use websockets, not inefficient background interval polling.

## 9. Security & Access Control

*   **JWT-Based Auth:** Stateless authentication with secure token storage.
*   **RBAC Enforced:** Security is applied on both the Frontend (UI hiding) and Backend (API protection).
*   **Role-Based Navigation:** The dashboard dynamically renders only the links relevant to the logged-in user.
*   **Authority/Admin Restrictions:** Higher privileges do not mean universal access; privacy boundaries are respected.
*   **Domain Enforcement:** Registration is locked to allowed institutional domains to prevent unauthorized access.

## 10. Setup & Installation

### Prerequisites
*   Node.js (v16+)
*   MongoDB (Local or Atlas)

### Steps

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Saravana-creator/KrackHack.git
    cd KrackHack
    ```

2.  **Install Dependencies**
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the `/server` directory with the following keys:
    ```env
    PORT=5000
    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    ADMIN_SECRET=<secret_for_admin_registration>
    NODE_ENV=development
    ```

4.  **Run Backend**
    ```bash
    cd server
    npm run dev
    ```

5.  **Run Frontend**
    ```bash
    cd client
    npm run dev
    ```

## 11. Usage Notes for Judges

*   **Log in as Authority:** Witness the "God-mode" analytics and governance view. This showcases the system's ability to provide high-level insights.
*   **Test the Grievance Flow:** Log in as a Student, submit a grievance, then log in as an Authority to view it. This demonstrates the timeline tracking and real-time updates.
*   **Faculty Resource Upload:** Test uploading a PDF in the Academic Hub and seeing it appear instanty for enrolled students.
*   **Value:** This system solves the problem of "he said, she said" in campus administration by creating an immutable digital record of interactions.

## 12. Hackathon Value Proposition

AEGIS PROTOCOL is not just another CRUD app; it is a **system of record**.
*   **Practical:** it maps directly to real-world institutional hierarchies.
*   **Scalable:** The separation of concerns and role-based architecture means it can handle thousands of users without logic coupling.
*   **Institutional Adoption:** It moves beyond simple "management" to "governance," offering tools for oversight that institutions desperately need.

## 13. Team & Credits

*   **Pradeep P** - Integration & Auth
*   **Nakulan S V** - Frontend Lead
*   **Saravana Perumal M** - Backend Lead
*   **Madan P A** - Q/A & Security

## 14. License

This project is licensed under the [MIT License](LICENSE).
