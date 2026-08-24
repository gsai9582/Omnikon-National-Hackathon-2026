# ResQTrace

ResQTrace is a full-stack disaster response and missing person tracking application.

## System Architecture
* **Frontend:** React, TailwindCSS, Vite (PWA configured)
* **Backend:** Spring Boot (Java 21), Spring Security (JWT), Spring Data JPA
* **Database:** MySQL 8.0+
* **AI Service:** FastAPI (Python 3.10+), OpenCV (Prototype face embeddings)
* **Storage:** Configurable Local Storage or S3-compatible Object Storage

## Local Development Setup

To run the application locally for development, you can use the provided `docker-compose.yml`.

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Start the services using Docker Compose:
   ```bash
   docker-compose up --build
   ```
   This will spin up:
   * **MySQL** on `localhost:3306`
   * **Spring Boot Backend** on `localhost:8080`
   * **FastAPI AI Service** on `localhost:8000`
   * **React Frontend** on `localhost:5173`

The frontend uses Vite's proxy to automatically route `/api` and `/ws` to the backend.

## Production Deployment Instructions

For production, the Frontend is built as a static site and served via Nginx. The Nginx container is configured to reverse-proxy `/api` requests to the Backend container, avoiding CORS issues entirely if served on the same domain.

### Environment Variables

Before deploying, ensure you configure the following environment variables (defined in `.env`):

* `DB_URL`: Production database URL (e.g., `jdbc:mysql://prod-db:3306/resqtrace...`)
* `DB_USERNAME` & `DB_PASSWORD`: Production database credentials.
* `JWT_SECRET`: A secure, randomly generated 256-bit string for signing auth tokens.
* `SERVER_PORT`: Port the backend listens on (default 8080).
* `RESQTRACE_CORS_ALLOWED_ORIGINS`: Allowed origins (e.g., `https://your-domain.com`).
* `RESQTRACE_STORAGE_PROVIDER`: Set to `local` or `s3`.
* `RESQTRACE_STORAGE_S3_BUCKET`: S3 Bucket name.
* `RESQTRACE_STORAGE_S3_REGION`: S3 Region.
* `AI_SERVICE_URL`: URL to the deployed AI service.

### Storage

* **Local**: Files will be saved in `/app/uploads` in the backend container. Use a Docker Volume to persist this directory.
* **S3**: Files will be pushed to the configured S3 bucket via the AWS SDK. Ensure the backend container has IAM permissions or provide AWS credentials via standard AWS environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).

### Health Checks

Health check endpoints are exposed for orchestrators (e.g., Kubernetes, ECS):
* **Backend**: `GET /api/health`
* **AI Service**: `GET /health`

### Live Demo URL

*Placeholder for live URL once DNS is configured: https://demo.resqtrace.org*
