# cPanel Node.js Deployment

Recommended backend URL: `https://kivisapi.e-pulse.top`

Use HTTPS for the API because the frontend is hosted at `https://kivis.e-pulse.top`. Calling `http://kivisapi.e-pulse.top` from the HTTPS frontend may be blocked by the browser.

## cPanel App Settings

- Node.js version: `20.18.3`
- Application mode: `Production`
- Application root: the uploaded backend folder, for example `kivisapi` or `kivis-backend`
- Application URL: `kivisapi.e-pulse.top`
- Application startup file: `dist/main.js`

## Server Commands

Run these from the backend application root after uploading:

```bash
npm install
npx prisma generate
npm run build
npx prisma migrate deploy
```

Then restart the Node.js app in cPanel.

## Environment Variables

Set these in the cPanel Node.js app environment:

```bash
NODE_ENV=production
CORS_ORIGIN=https://kivis.e-pulse.top
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
PAYSTACK_CALLBACK_URL=https://kivis.e-pulse.top/payment/success
ARKASEL_API_KEY=replace-with-arkesel-api-key
ARKASEL_SENDER=Kiviz
ARKASEL_SANDBOX=false
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=info@example.com
SMTP_PASS=replace-with-smtp-password
CLOUDINARY_CLOUD_NAME=replace-with-cloud-name
CLOUDINARY_API_KEY=replace-with-cloudinary-api-key
CLOUDINARY_API_SECRET=replace-with-cloudinary-api-secret
```

Do not manually set `PORT` in cPanel unless the panel asks for it. cPanel normally injects the correct port for the Node app.