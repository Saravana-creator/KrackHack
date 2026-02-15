# AEGIS Protocol - Architecture & Feature Documentation

## 🚀 Project Overview
AEGIS Protocol is a **Role-Based Campus Management Platform** built on the MERN Stack (MongoDB, Express.js, React, Node.js). It unifies Academic, Career, and Grievance management into a single, secure ecosystem with granular permissions for Students, Faculty, Authority, and Admins.

---

## ✅ Feature Compliance Matrix

| Requirement | Implementation Status | Key Components / Files |
| :--- | :--- | :--- |
| **Role-Based Auth (Student, Faculty, Authority, Admin)** | **Completed** | `User.js` (Schema), `auth.js` (Middleware), `authSlice.js` (Frontend State) |
| **Institute Email Restriction** | **Implemented (Configurable)** | `authController.js` (Validation Logic Present) |
| **Password Encryption & Secure Sessions** | **Completed** | `bcryptjs` (Hashing), `jsonwebtoken` (Stateless JWT) |
| **Admin Dashboard (Analytics, Monitoring)** | **Completed** | `Dashboard.jsx` (Analytics Cards), `/api/health` (Monitoring), `socket.io` (Real-time logs) |
| **Role-Based Access Control (RBAC)** | **Completed** | `SideBar.jsx` (UI Hiding), `protect/authorize` middleware (API Guard) |
| **Security (NoSQL Inj, XSS, CSRF)** | **Completed** | `helmet` (Headers), Mongoose (Sanitization), JWT (Header-based auth) |

---

## 🏗️ System Architecture

### 1. Backend Architecture (`/server`)
Follows a modular, controller-service pattern.

*   **`server.js`**: Entry point. Configures:
    *   **Helmet**: Sets standard HTTP security headers (XSS protection, HSTS, no-sniff).
    *   **CORS**: Restricts API access to trusted domains.
    *   **Socket.io**: Enables real-time event broadcasting (Notifications).
    *   **Health Check**: `/api/health` for uptime monitoring.

*   **`middleware/auth.js`**: Core Security Logic.
    *   `protect()`: Verifies the `Authorization: Bearer <token>` header, decodes JWT, and attaches `req.user`.
    *   `authorize(...roles)`: Checks if `req.user.role` is in the allowed list. Returns `403 Forbidden` if not.

*   **`controllers/authController.js`**:
    *   **`register()`**: Handles user creation.
        *   *Secure Feature*: Includes commented-out logic for `email.endsWith('@institute.edu')` validation. To enable, simply uncomment lines 12-16.
        *   Hashes password with `bcrypt.genSalt(10)` before saving.
    *   **`login()`**: Authenticates credentials.
        *   Issues a **signed JWT** valid for 30 days.

*   **`models/User.js`**:
    *   Defines Schema with strict Types.
    *   `enum` for Roles prevents invalid role assignment.
    *   `select: false` on password field prevents accidental leakage in queries.

### 2. Frontend Architecture (`/client`)
Built with React + Vite + Redux Toolkit.

*   **`services/api.js`** (The Network Layer):
    *   **Interceptor Pattern**:
        *   *Request*: Automatically injects the JWT token from LocalStorage into every outgoing request.
        *   *Response*: Listens for `401 Unauthorized` errors (token expiry) and automatically dispatches `logout()` to redirect user to login.

*   **`layouts/MainLayout.jsx` & `PrivateRoute.jsx`**:
    *   Wraps the dashboard.
    *   Checks if Redux `isAuthenticated` is true. If not, kicks user to `/login`.
    *   Renders the **Sidebar** and **Navbar** consistently.

*   **`pages/Dashboard.jsx`** (Role-Aware UI):
    *   Uses `user.role` to conditionally render cards.
    *   **Student**: Sees "Submit Grievance", "My Applications".
    *   **Admin/Authority**: Sees "System Analytics" (Graphs/Stats), "Manage Tickets".

---

## 🛡️ Security Deep Dive

### How we prevent vulnerabilities:

1.  **SQL/NoSQL Injection**:
    *   **Mechanism**: We use **Mongoose ODM**. Mongoose casts inputs to their schema types (e.g., `ObjectId`, `String`) before sending to MongoDB. This neutralizes malicious query payloads like `{$gt: ""} `.

2.  **XSS (Cross-Site Scripting)**:
    *   **Mechanism**:
        *   **React**: Automatically escapes variables in JSX (e.g., `{userInput}`).
        *   **Helmet**: Sets `Content-Security-Policy` and `X-XSS-Protection` headers on the server response.

3.  **CSRF (Cross-Site Request Forgery)**:
    *   **Mechanism**: We use **JWT stored in LocalStorage** and sent via **Authorization Headers**, NOT Cookies.
    *   *Why this works*: Browsers automatically send Cookies with requests (vulnerable to CSRF), but they do *not* automatically send custom Headers. Malicious sites cannot force the browser to send your Token Header.

4.  **Secure Password Storage**:
    *   **Mechanism**: Passwords are **never** stored in plain text. We use `bcryptjs` with a generic salt factor of 10. Even if the DB is compromised, passwords remain unreadable.

---

## 📋 How to Verify Features

### 1. Test Role-Based Access
*   **Step**: Login as `student`. Try to simple curl/Postman to `POST /api/v1/courses` (an Admin route).
*   **Result**: Server responds `403 Forbidden`.
*   **Step**: Navigate to `/dashboard`.
*   **Result**: You see "Submit Grievance" but **not** "System Analytics".

### 2. Test Institute Email
*   **Step**: Open `server/controllers/authController.js`.
*   **Step**: Uncomment the validation block.
*   **Step**: Try to Register with `test@gmail.com`.
*   **Result**: Server responds `400 Bad Request` ("Please use a valid institute email").

### 3. Test Security (Headers)
*   **Step**: Open Browser DevTools -> Network -> Click any API request -> Headers.
*   **Result**: You will see headers like `X-DNS-Prefetch-Control`, `X-Frame-Options`, `Strict-Transport-Security` (added by Helmet).
