# Backend VPS Deployment

This branch is prepared to run only the NestJS backend in Docker. The frontend can stay hosted separately on cPanel.

## 1. Clone the backend branch

```bash
git clone -b backend https://github.com/Jk0624/Kivis-Executive-Hotel-Software.git
cd Kivis-Executive-Hotel-Software/backend
```

## 2. Create the environment file

```bash
cp .env.example .env
nano .env
```

Set `DATABASE_URL`, `JWT_SECRET`, payment keys, SMS keys, Cloudinary keys, SMTP settings, and `CORS_ORIGIN`.

Use the live cPanel frontend URL for `CORS_ORIGIN`. For this project:

```env
CORS_ORIGIN=https://kivis.e-pulse.top
```

## 3. Start the backend

```bash
docker compose up -d --build
```

The compose command runs `prisma migrate deploy` before starting NestJS.

## 4. Check the container

```bash
docker compose ps
docker compose logs -f api
```

By default the API is exposed on VPS port `3001`. To publish a different VPS port, set `HOST_PORT` in `.env`.

## 5. Reverse proxy

Point your VPS web server or proxy to:

```text
http://127.0.0.1:3001
```

For production, put the public backend URL behind HTTPS and update the cPanel frontend API base URL to that backend URL.
