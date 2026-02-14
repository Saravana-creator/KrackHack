# AEGIS Protocol - Campus Management Platform

AEGIS Protocol is a production-ready, unified campus management system designed to break down silos between student services, academic resources, and governance tools.

## 🚀 Key Features

*   **Role-Based Dashboards**: tailored views for Students, Faculty, Authorities, and Admins.
*   **Grievance Management**: Full lifecycle tracking of student grievances with real-time updates.
*   **Secure Authentication**: JWT-based login with Role-Based Access Control (RBAC).
*   **Real-time Notifications**: Socket.io integration for instant status updates.
*   **Modern UI/UX**: Built with React, Vite, and Material UI, featuring a custom dynamic cursor and "Dark Nebula" theme.

## 🛠 Tech Stack

### Frontend
*   **React 18** (Vite)
*   **Redux Toolkit** (State Management)
*   **Material UI & Tailwind CSS** (Styling)
*   **Framer Motion** (Animations)
*   **Socket.io Client**
*   **Axios**

### Backend
*   **Node.js & Express**
*   **MongoDB & Mongoose**
*   **JWT & Bcrypt** (Security)
*   **Socket.io** (Real-time)
*   **Winston** (Logging)

## 📂 Folder Structure

```
aegis-protocol/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Cursor, Navbar, etc.)
│   │   ├── pages/          # Application pages (Dashboard, Login, etc.)
│   │   ├── redux/          # Redux slices and store
│   │   └── ...
│   └── ...
├── server/                 # Node.js Backend
│   ├── config/             # DB Configuration
│   ├── controllers/        # Request Logic
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # API Routes
│   ├── middleware/         # Auth & Error Middleware
│   └── ...
└── README.md
```

## ⚡ Getting Started

### Prerequisites
*   Node.js (v14 or higher)
*   MongoDB (Local running instance or Atlas URI)

### Backend Setup
1.  Navigate to `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up Environment Variables:
    *   The `.env` file is pre-configured with defaults. Ensure MongoDB is running.
4.  Start the server:
    ```bash
    npm run dev
    ```
    Server runs on `http://localhost:5000`

### Frontend Setup
1.  Navigate to `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    App runs on `http://localhost:3000`

## 🧪 Testing with Requestly
1.  Install the **Requestly** browser extension.
2.  Import the `server/utils/requestlyMock.json` file to mock API responses if the backend is not running or for testing specific scenarios.

## 🎨 UI & UX
*   **Dynamic Cursor**: A custom cursor tracks mouse movement with a smooth trailing effect.
*   **Theme**: Deep Navy, Electric Blue, and Teal accents provide a professional, high-tech aesthetic.

---
Built for KrackHack.
