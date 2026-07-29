# Isolated production deployment

This configuration uses:

- Compose project name `kivis-backend`
- container-internal port `3001`
- host binding `127.0.0.1:3001` (not publicly exposed)
- named upload volume `kivis_backend_uploads`
- Nginx virtual host `kivisapi.e-pulse.top`

The existing production services on ports 3000 and 8000 are not changed.

## 1. DNS

Create an `A` record:

```text
kivisapi.e-pulse.top -> THIS_VPS_PUBLIC_IP
```

If another domain will be used, replace `kivisapi.e-pulse.top` in the Nginx
file and environment values below.

## 2. Environment

From the `backend` directory:

```bash
cp .env.example .env
chmod 600 .env
```

Edit `.env`. At minimum set:

```env
NODE_ENV=production
PORT=3001
HOST_PORT=3001
CORS_ORIGIN=https://kivis.e-pulse.top
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
JWT_SECRET=GENERATE_A_LONG_RANDOM_SECRET
PAYSTACK_CALLBACK_URL=https://kivis.e-pulse.top/payment-success
```

`CORS_ORIGIN` accepts comma-separated origins if more than one frontend is
required. Do not commit `.env`.

## 3. Preflight and start

These commands affect only the `kivis-backend` Compose project:

```bash
docker compose -p kivis-backend config
docker compose -p kivis-backend build
docker compose -p kivis-backend up -d
docker compose -p kivis-backend ps
docker compose -p kivis-backend logs --tail=100 api
curl --fail --show-error http://127.0.0.1:3001/
```

The container executes `prisma migrate deploy` before starting the API.
Back up an existing production database before the first migration.

## 4. Nginx and TLS

Install the HTTP-only vhost after replacing the domain if necessary:

```bash
sudo cp deploy/nginx/kivis-api.http.conf /etc/nginx/sites-available/kivis-api
sudo ln -s /etc/nginx/sites-available/kivis-api /etc/nginx/sites-enabled/kivis-api
sudo nginx -t
sudo systemctl reload nginx
```

Only after DNS resolves to this VPS:

```bash
sudo certbot --nginx -d kivisapi.e-pulse.top
sudo nginx -t
```

## 5. Rollback

Disable only this vhost:

```bash
sudo unlink /etc/nginx/sites-enabled/kivis-api
sudo nginx -t
sudo systemctl reload nginx
```

Stop only this backend:

```bash
docker compose -p kivis-backend down
```

Do not add `--volumes`; the upload volume should survive rollback/redeploy.
