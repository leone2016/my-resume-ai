# My Resume AI - Dockerized Backend

This directory contains the backend logic for the **My Resume AI** extension. It is a **Node.js (Express)** application containerized with **Docker** that uses the **Tectonic** engine to generate PDFs from LaTeX.

## 🚀 Features

- **PDF Generation**: Converts LaTeX code to PDF using an embedded Tectonic binary.
- **Local API**: Exposes a REST API on port `1991`.
- **Dockerized**: Fully self-contained environment (no need to install LaTeX on the host machine, just Docker).

## 🛠️ Architecture

- **Server**: Express.js + TypeScript
- **Engine**: Tectonic (XeTeX/TeXLive powered)
- **Storage**: Local temporary storage for generation, served via static route.

## 📋 Prerequisites

1.  **Docker**: Ensure Docker Desktop is installed and running.
2.  **Tectonic Binary**: The `tectonic` binary must be placed in `backend/tectonic/bin/tectonic`.
    - *Note*: It must be compatible with the Docker image (Alpine Linux uses `musl`, so `x86_64-unknown-linux-musl` is required).

## 📦 Installation & Usage

### 1. Build the Docker Image

Navigate to the `backend` directory and build the image.
**Note for Mac Users (M1/M2/M3)**: Since the downloaded Tectonic binary is for Linux x86_64, you must specify the platform:

```bash
docker build --platform linux/amd64 -t my-resume-backend .
```

### 2. Run the Container

Start the server on port 1991:

```bash
docker run --platform linux/amd64 -p 1991:1991 my-resume-backend
```

The server will start at `http://localhost:1991`.

## 🔌 API Endpoints

### `POST /generate-pdf`

Generates a PDF from the provided LaTeX content.

**Request Body:**
```json
{
  "latex": "\\documentclass{article}..."
}
```

**Response:**
```json
{
  "url": "http://localhost:1991/pdfs/uuid-file.pdf"
}
```

## 📂 Project Structure

- `src/server.ts`: Entry point.
- `src/controllers`: Request handlers.
- `src/usecases`: Business logic.
- `src/services`: Adapters (PdfService wraps the Tectonic execution).
- `Dockerfile`: Configuration for the container image.
