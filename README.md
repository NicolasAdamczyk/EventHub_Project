# EventHub

A comprehensive Full-Stack Event and Participant Management System developed as part of the Web Programming 2026 course. EventHub provides a robust platform for managing events, registering participants, and handling role-based access control through a decoupled frontend-backend architecture.

---

## Live Deployment

The frontend application is successfully deployed and accessible to the public via Vercel:
**[EventHub Live Application](https://event-hub-project-five.vercel.app)**

*Note: The primary backend API is hosted securely on PythonAnywhere.*

---

## Core Features

* **Complete CRUD Operations:** Create, read, update, and delete events and participant profiles.
* **Advanced Registration System:** Handles many-to-many relationships, allowing participants to register for multiple events while strictly preventing duplicate registrations.
* **Role-Based Access Control:** Secure token-based authentication distinguishing between Administrators (full read/write access) and Viewers (read-only access).
* **Business Logic Validation:** Backend-enforced rules preventing the creation of past events and maintaining database integrity.
* **Responsive UI:** A seamless, single-page application experience with dynamic state management and routing.

---

## Technology Stack

**Frontend (Client)**
* React.js (Single Page Application)
* Vite (Build tool)
* React Router (Client-side routing)
* Axios (HTTP client with interceptors)

**Primary Backend (API & Database)**
* Python / Django
* Django REST Framework (DRF)
* SQLite (Database)
* Token Authentication

**Secondary Backend (Comparative Study)**
* Node.js / Express
* Sqlite3 Database Driver

---

## Project Architecture

The project is structured into distinct directories to maintain a strict separation of concerns between the client interface and the server logic.

```text
eventhub-project/
│
├── frontend/                 # React Single Page Application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable React components (Auth, Dashboard, etc.)
│   │   ├── services/         # Axios configuration and API calls
│   │   ├── App.jsx           # Main application routing
│   │   └── main.jsx          # React DOM entry point
│   ├── package.json          # Frontend dependencies
│   └── vercel.json           # Vercel deployment configuration (SPA routing)
│
├── backend/                  # Primary Django REST API
│   ├── api/                  # Main Django app
│   │   ├── models.py         # Database schema (Event, Participant, Registration)
│   │   ├── serializers.py    # Data transformation and business validation
│   │   ├── views.py          # ViewSets and custom API endpoints
│   │   └── permissions.py    # Custom role-based access rules
│   ├── backend/              # Core Django settings
│   │   ├── settings.py       # Configuration, CORS, and Installed Apps
│   │   └── urls.py           # Main URL routing
│   ├── db.sqlite3            # SQLite Database
│   └── manage.py             # Django command-line utility
│
└── node_backend/             # Secondary Express API (Comparative Study)
    ├── server.js             # Express server setup and routing
    └── package.json          # Node dependencies
