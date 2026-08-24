<div align="center">
  <h1 align="center">ResQTrace</h1>
  <p align="center">
    <strong>A full-stack disaster response and missing person tracking application.</strong>
    <br />
    <br />
    <a href="https://demo.resqtrace.org">View Live Demo</a>
    ·
    <a href="https://github.com/yourusername/ResQTrace/issues">Report Bug</a>
    ·
    <a href="https://github.com/yourusername/ResQTrace/issues">Request Feature</a>
  </p>
</div>

<!-- Badges -->
<div align="center">
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=java&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite_PWA-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite PWA" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
</div>

---

## 📖 Overview

**ResQTrace** is a comprehensive, full-stack application designed to aid emergency responders, authorities, and citizens during disaster scenarios. By combining real-time task management, offline-capable Progressive Web App (PWA) reporting, Geographic Information System (GIS) mapping, and AI-powered facial recognition, ResQTrace streamlines the critical process of tracking missing persons and deploying rescue resources.

## ✨ Key Features

* 📱 **Offline-First PWA:** Citizens and responders can create reports and update task statuses even without an internet connection. Data syncs automatically upon reconnection using IndexedDB and Service Workers.
* 🤖 **AI-Powered Face Matching:** Utilizes OpenCV and FastAPI to generate face embeddings, suggesting potential duplicate cases or matches across the platform (with mandatory human-in-the-loop verification).
* 🗺️ **Geographic Mapping & Search Zones:** Interactive mapping powered by Leaflet to visualize last known locations and prototype search zones.
* ⚡ **Real-Time Task Management:** Live WebSocket updates (STOMP/SockJS) for responder task assignments and status changes.
* 🔐 **Role-Based Access Control:** Secure JWT authentication with distinct roles for Citizens, Responders, Authorities, and Administrators.

---

## 🏗️ System Architecture

ResQTrace is built using a modern microservice-inspired architecture:

* **Frontend:** React 19, TailwindCSS 4, Vite (PWA configured), React-Leaflet
* **Backend:** Spring Boot (Java 21), Spring Security (JWT), Spring Data JPA
* **Database:** MySQL 8.0+
* **AI Service:** FastAPI (Python 3.10+), OpenCV (Face embeddings)
* **Storage:** Configurable Local Storage or S3-compatible Object Storage

---

## 📦 Local Development Setup

To run the application locally for development, we provide a pre-configured `docker-compose.yml`.

### Prerequisites
* Docker & Docker Compose
* Node.js 20+ (for local frontend development)
* JDK 21 (for local backend development)

### Quick Start (Docker)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ResQTrace.git
   cd ResQTrace
   ```

2. **Configure Environment:**
   Copy the example environment file and adjust if necessary.
   ```bash
   cp .env.example .env
   ```

3. **Spin up the stack:**
   ```bash
   docker-compose up --build
   ```
   
   This will spin up:
   * **MySQL** on `localhost:3306`
   * **Spring Boot Backend** on `localhost:8080`
   * **FastAPI AI Service** on `localhost:8000`
   * **React Frontend** on `localhost:5173`

> **Note:** The frontend uses Vite's proxy to automatically route `/api` and `/ws` requests to the backend, bypassing any local CORS issues.

---

## 🌐 Production Deployment Instructions

For production, the Frontend is built as a static site and served via **Nginx**. The Nginx container is configured to reverse-proxy `/api` requests to the Backend container, avoiding CORS issues entirely when served on the same domain.

### Environment Variables

Before deploying, ensure you configure the following environment variables (defined in `.env`):

* `DB_URL`: Production database URL (e.g., `jdbc:mysql://prod-db:3306/resqtrace...`)
* `DB_USERNAME` & `DB_PASSWORD`: Production database credentials.
* `JWT_SECRET`: A secure, randomly generated 256-bit string for signing auth tokens.
* `SERVER_PORT`: Port the backend listens on (default `8080`).
* `RESQTRACE_CORS_ALLOWED_ORIGINS`: Allowed origins (e.g., `https://your-domain.com`).
* `RESQTRACE_STORAGE_PROVIDER`: Set to `local` or `s3`.
* `RESQTRACE_STORAGE_S3_BUCKET`: Your S3 Bucket name.
* `RESQTRACE_STORAGE_S3_REGION`: Your S3 Region.
* `AI_SERVICE_URL`: URL to the deployed AI service.

### Storage Configuration

* **Local Storage:** Files will be saved in `/app/uploads` inside the backend container. **Important:** Use a Docker Volume to persist this directory across container restarts.
* **S3 Storage:** Files will be pushed to the configured S3 bucket via the AWS SDK. Ensure the backend container has IAM permissions or provide AWS credentials via standard AWS environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).

### Health Checks

Standard health check endpoints are exposed for container orchestrators (e.g., Kubernetes, ECS, Docker Swarm):
* **Backend:** `GET /api/health`
* **AI Service:** `GET /health`

---

## 📸 Screenshots

| Dashboard | Map View |
|:---:|:---:|
| <img src="https://via.placeholder.com/600x350/0f172a/ffffff?text=Dashboard+Preview" alt="Dashboard" /> | <img src="https://via.placeholder.com/600x350/0f172a/ffffff?text=Map+Preview" alt="Map View" /> |

| Offline PWA Reporting | AI Match Verification |
|:---:|:---:|
| <img src="https://via.placeholder.com/600x350/0f172a/ffffff?text=Offline+Sync+Queue" alt="Offline PWA" /> | <img src="https://via.placeholder.com/600x350/0f172a/ffffff?text=AI+Facial+Match" alt="AI Verification" /> |

*(Replace placeholder URLs with actual screenshots of your application)*

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
<div align="center">
  Built with ❤️ for emergency responders worldwide.
</div>
