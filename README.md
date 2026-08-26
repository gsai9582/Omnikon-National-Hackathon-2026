<div align="center">
  <h1 align="center">ResQTrace</h1>
  <p align="center">
    <strong>A full-stack disaster response and missing person tracking application.</strong>
    <br />
    <br />
    <a href="https://demo.resqtrace.org">View Live Demo</a>
    ·
    <a href="https://github.com/gsai9582/ResQTrace/issues">Report Bug</a>
    ·
    <a href="https://github.com/gsai9582/ResQTrace/issues">Request Feature</a>
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
* **Storage:** Configurable Local Storage.

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
   git clone https://github.com/gsai9582/ResQTrace.git
   cd ResQTrace
   ```

2. **Configure Environment:**
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

### Health Checks

Standard health check endpoints are exposed for container orchestrators (e.g., Kubernetes, ECS, Docker Swarm):
* **Backend:** `GET /api/health`
* **AI Service:** `GET /health`

---

## 📸 Screenshots

| Dashboard | Map View |
|:---:|:---:|
| <img src= "blob:https://web.whatsapp.com/1269cd3e-d75e-4927-8b57-baa44a176d11" alt="Dashboard" /> | <img src="blob:https://web.whatsapp.com/e0e1aee7-6e4a-4f3d-8d87-f28d013747fc" alt="Map View" /> |

| AI Match Verification |
|:---:|:---:|
| <img src="blob:https://web.whatsapp.com/ecd24a83-98ed-48d3-b853-e41bed6cca35" alt="AI Verification" /> |


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
