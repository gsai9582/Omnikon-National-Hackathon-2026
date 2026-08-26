<div align="center">

# 🚨 ResQTrace

### Disaster Response • Missing Person Tracking • AI-Assisted Rescue Coordination

<p>
  <strong>
    A full-stack emergency response platform that connects citizens,
    responders, authorities, and AI-assisted intelligence in one system.
  </strong>
</p>

<br/>

<a href="https://demo.resqtrace.org">
  <img src="https://img.shields.io/badge/🌐_LIVE_DEMO-Visit_ResQTrace-2563EB?style=for-the-badge" alt="Live Demo" />
</a>

<a href="https://drive.google.com/file/d/1QBh8tNez5VD5SJSNxiD68kpf2_OuaIwX/view?usp=drivesdk">
  <img src="https://img.shields.io/badge/🎥_DEMO_VIDEO-Watch_Demo-EA4335?style=for-the-badge" alt="Demo Video" />
</a>

<a href="https://github.com/gsai9582/ResQTrace">
  <img src="https://img.shields.io/badge/💻_SOURCE_CODE-GitHub-181717?style=for-the-badge&logo=github" alt="GitHub Repository" />
</a>

<br/><br/>

<img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
<img src="https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
<img src="https://img.shields.io/badge/Vite_PWA-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
<img src="https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />

<br/>

<img src="https://img.shields.io/badge/Leaflet-GIS-199900?style=flat-square&logo=leaflet&logoColor=white" alt="Leaflet" />
<img src="https://img.shields.io/badge/WebSockets-Real--Time-4B5563?style=flat-square" alt="WebSockets" />
<img src="https://img.shields.io/badge/JWT-Authentication-000000?style=flat-square" alt="JWT" />
<img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />

</div>

---

## 🚨 The Problem

During disasters, missing-person information is often scattered across calls, messages, spreadsheets, social media, and disconnected teams.

This creates critical problems:

* 📋 Fragmented missing-person records
* 📍 Difficulty tracking last-known locations
* 🚑 Slow coordination between responders
* 🔎 Manual identification of recovered individuals
* 📡 Poor connectivity during emergencies
* 🔄 Delayed updates between field teams and authorities

**ResQTrace brings these processes together into one coordinated emergency response platform.**

---

## 💡 Our Solution

**ResQTrace** is a full-stack disaster response and missing-person tracking platform designed to improve how emergency information is **reported, verified, located, matched, and acted upon**.

It combines:

> **Real-time coordination + GIS mapping + offline-capable reporting + AI-assisted face matching + role-based access control**

into a single platform.

---

## 🎥 Live Demo

### ▶️ See ResQTrace in Action

Experience the complete ResQTrace workflow through our demonstration video.

<p align="center">
  <a href="https://drive.google.com/file/d/1QBh8tNez5VD5SJSNxiD68kpf2_OuaIwX/view?usp=drivesdk">
    <img src="https://img.shields.io/badge/▶_WATCH_LIVE_DEMO-Open_Demo_Video-EA4335?style=for-the-badge" alt="Watch Demo" />
  </a>
</p>

The demonstration covers:

**Report → Verify → Locate → Match → Assign → Respond → Track**

---

## ✨ Core Capabilities

<table>
<tr>
<td width="50%">

### 🤖 AI-Assisted Face Matching

Uses a dedicated FastAPI service with OpenCV-based facial feature processing to identify potential matches between reported missing persons and recovered individuals.

**Human verification remains mandatory before confirmation.**

</td>

<td width="50%">

### 🗺️ GIS-Based Tracking

Interactive maps visualize:

* Last known locations
* Missing-person reports
* Incident locations
* Responder activity
* Prototype search zones

</td>
</tr>

<tr>
<td>

### ⚡ Real-Time Coordination

WebSocket-based communication enables responders and authorities to receive task and status updates without repeatedly refreshing the application.

</td>

<td>

### 📱 Offline-Capable Reporting

The Progressive Web App architecture is designed to support emergency reporting in environments where connectivity may be unreliable.

</td>
</tr>

<tr>
<td>

### 🔐 Role-Based Access

Different permissions and workflows are provided for:

* Citizens
* Responders
* Authorities
* Administrators

</td>

<td>

### 📊 Centralized Case Management

Missing-person cases, reports, locations, assignments, and verification workflows can be managed through a centralized platform.

</td>
</tr>
</table>

---

# 🔄 How ResQTrace Works

```text
                    ┌───────────────────┐
                    │     CITIZEN       │
                    │  Report Missing   │
                    │     Person        │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   RESQTRACE API   │
                    │  Case Management  │
                    └─────────┬─────────┘
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
      ┌────────────┐   ┌────────────┐   ┌────────────┐
      │    GIS     │   │     AI     │   │  Authority │
      │   Mapping  │   │   Matching │   │ Verification│
      └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
            │                │                │
            └────────────────┼────────────────┘
                             ▼
                    ┌───────────────────┐
                    │    RESPONDER      │
                    │  Task Assignment  │
                    │   & Deployment    │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  RESCUE / CASE    │
                    │     RESOLUTION    │
                    └───────────────────┘
```

---

# 👥 User Roles

| Role                  | Responsibilities                                           |
| --------------------- | ---------------------------------------------------------- |
| 👤 **Citizen**        | Report missing persons and provide relevant information    |
| 🚑 **Responder**      | View assigned cases, manage tasks, and update field status |
| 🏛️ **Authority**     | Verify cases, review AI suggestions, coordinate response   |
| 🛡️ **Administrator** | Manage users, system access, and platform operations       |

---

# 🤖 AI-Assisted Identification

ResQTrace separates **AI assistance** from **final human decision-making**.

### Processing Pipeline

```text
Image Upload
     ↓
Face Detection
     ↓
Feature / Embedding Generation
     ↓
Similarity Comparison
     ↓
Potential Match
     ↓
Human Verification
     ↓
Confirmed / Rejected
```

### Why Human-in-the-Loop?

AI-generated matches are treated as **recommendations rather than final decisions**.

This helps reduce the risk of incorrectly identifying individuals during high-stakes emergency situations.

---

# 🗺️ GIS & Search Intelligence

The mapping layer provides a visual overview of emergency information.

### Map capabilities include:

* 📍 Last-known-person locations
* 🚨 Incident locations
* 🔎 Search-area visualization
* 🚑 Responder coordination
* 📌 Location-based case information

The platform is designed to help responders understand **where cases are concentrated and where resources may need to be deployed**.

---

# ⚡ Real-Time Response

ResQTrace uses WebSocket communication to support real-time application updates.

```text
Authority
    │
    │ Assign Task
    ▼
Backend
    │
    │ WebSocket
    ▼
Responder
    │
    │ Update Status
    ▼
Backend
    │
    ▼
Authority Dashboard
```

This enables faster communication between operational teams.

---

# 📱 PWA & Emergency Connectivity

ResQTrace is designed as a Progressive Web Application.

### PWA capabilities

* 📱 Installable web application
* ⚡ Fast application loading
* 📡 Offline-capable reporting architecture
* 🔄 Data synchronization approach
* 💻 Desktop and mobile accessibility

This is particularly important for disaster environments where network connectivity may be intermittent.

---

# 🏗️ System Architecture

ResQTrace follows a **microservice-inspired full-stack architecture**.

```text
┌──────────────────────────────────────────┐
│              React PWA Frontend          │
│        React + Vite + TailwindCSS        │
│             React-Leaflet                │
└────────────────────┬─────────────────────┘
                     │
              REST / WebSocket
                     │
                     ▼
┌──────────────────────────────────────────┐
│           Spring Boot Backend            │
│                                          │
│  Spring Security │ JWT │ JPA │ STOMP     │
│                                          │
│      Case Management & Business Logic     │
└──────────────┬───────────────┬───────────┘
               │               │
               ▼               ▼
        ┌────────────┐   ┌──────────────┐
        │   MySQL    │   │ FastAPI AI   │
        │  Database  │   │   Service    │
        └────────────┘   └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │    OpenCV    │
                         │ Face Matching│
                         └──────────────┘
```

---

# 🧰 Technology Stack

| Layer             | Technologies                               |
| ----------------- | ------------------------------------------ |
| 🎨 **Frontend**   | React 19, Vite, TailwindCSS, React-Leaflet |
| 📱 **PWA**        | Vite PWA                                   |
| ⚙️ **Backend**    | Java 21, Spring Boot 3.3                   |
| 🔐 **Security**   | Spring Security, JWT                       |
| 🗄️ **Database**  | MySQL 8.0+                                 |
| 🤖 **AI Service** | Python, FastAPI, OpenCV                    |
| 🗺️ **Mapping**   | Leaflet, React-Leaflet                     |
| ⚡ **Real-Time**   | WebSocket, STOMP, SockJS                   |
| 📦 **Deployment** | Docker, Docker Compose, Nginx              |

---

# 🔐 Security

ResQTrace incorporates security mechanisms appropriate for a multi-role emergency platform.

### Security features

* 🔑 JWT-based authentication
* 👥 Role-based authorization
* 🛡️ Protected API endpoints
* 🔒 Separation of user permissions
* 👨‍⚖️ Human verification for AI-assisted matches

---

# 📦 Local Development

## Prerequisites

* Docker & Docker Compose
* Node.js 20+
* JDK 21
* Python 3.10+ for AI service development

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/gsai9582/ResQTrace.git
cd ResQTrace
```

### 2. Configure environment

```bash
cp .env.example .env
```

Configure the required environment variables inside `.env`.

### 3. Start the application

```bash
docker-compose up --build
```

### Services

| Service                | Port   |
| ---------------------- | ------ |
| 🌐 React Frontend      | `5173` |
| ⚙️ Spring Boot Backend | `8080` |
| 🤖 FastAPI AI Service  | `8000` |
| 🗄️ MySQL              | `3306` |

---

# 🌐 Production Architecture

For production deployments, the frontend can be built as a static application and served through **Nginx**.

Nginx acts as the reverse proxy for backend API requests, allowing the application to operate under a unified domain and reducing cross-origin configuration complexity.

### Health Endpoints

```text
Backend
GET /api/health

AI Service
GET /health
```

---

# 📈 What Makes ResQTrace Different?

| Traditional Approach      | ResQTrace                             |
| ------------------------- | ------------------------------------- |
| 📄 Scattered records      | 🗂️ Centralized case management       |
| 📞 Manual coordination    | ⚡ Real-time task updates              |
| 📍 Text-based locations   | 🗺️ GIS visualization                 |
| 🔎 Manual identification  | 🤖 AI-assisted matching               |
| 📡 Connectivity dependent | 📱 PWA / offline-capable architecture |
| 👤 Single workflow        | 👥 Role-specific workflows            |
| ❓ AI makes decision       | 👨‍⚖️ Human-in-the-loop verification  |

---

# 🎯 Impact

ResQTrace aims to reduce the time between:

> **Report → Identification → Location → Assignment → Response**

By bringing critical information into one platform, the system can help emergency teams make faster, more informed decisions during disaster-response operations.

---

# 🚀 Future Scope

The platform can be extended with:

* 🛰️ Live GPS tracking of responders
* 📡 SMS-based emergency reporting
* 🧠 Advanced AI-based identity matching
* 🌍 Multi-disaster incident management
* 📊 Advanced emergency analytics
* 🛰️ Satellite / drone imagery integration
* 🔔 Intelligent emergency notifications
* 🗺️ Automated search-zone optimization
* 🌐 Multi-language citizen reporting
* 📱 Dedicated Android/iOS responder application

---

# 🧪 Project Status

<div align="center">

| Component           | Status         |
| ------------------- | -------------- |
| 🌐 Frontend         | 🟢 Implemented |
| ⚙️ Backend          | 🟢 Implemented |
| 🗄️ Database        | 🟢 Implemented |
| 🔐 Authentication   | 🟢 Implemented |
| 🗺️ GIS Mapping     | 🟢 Implemented |
| ⚡ Real-Time Updates | 🟢 Implemented |
| 📱 PWA              | 🟢 Implemented |
| 🤖 AI Service       | 🟢 Implemented |
| 🎥 Demo             | 🟢 Available   |

</div>

---

# 🎥 Demonstration

<p align="center">

<a href="https://drive.google.com/file/d/1QBh8tNez5VD5SJSNxiD68kpf2_OuaIwX/view?usp=drivesdk">

<img src="https://img.shields.io/badge/▶_WATCH_RESQTRACE_DEMO-Click_Here-EA4335?style=for-the-badge" alt="Watch ResQTrace Demo"/>

</a>

</p>

---

# 🤝 Contributing

Contributions are welcome and appreciated.

1. Fork the project
2. Create your feature branch

```bash
git checkout -b feature/AmazingFeature
```

3. Commit your changes

```bash
git commit -m "Add AmazingFeature"
```

4. Push the branch

```bash
git push origin feature/AmazingFeature
```

5. Open a Pull Request

---

# 📄 License

Distributed under the MIT License.

See the `LICENSE` file for more information.

---

# 👨‍💻 Team ResQTrace

<div align="center">

### Built for the future of emergency response.

**ResQTrace**

*Technology • Intelligence • Coordination • Faster Response*

<br/>

Built with ❤️ for emergency responders and communities worldwide.

</div>

---

<div align="center">

⭐ **If you find ResQTrace useful, consider giving the repository a star!**

</div>
