# Deployment Guide

## Quick Deploy to Vercel

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables in Vercel**
   - Go to your Vercel project settings
   - Add environment variable: `JWT_SECRET` with a secure random string
   - Example: `your-super-secure-jwt-secret-key-change-this-in-production`

3. **Deploy**
   ```bash
   npx vercel --prod
   ```

4. **Initialize Database**
   After deployment, call the init endpoint to set up the database:
   ```bash
   curl -X POST https://your-app.vercel.app/api/init
   ```

## Environment Variables

- `JWT_SECRET`: Required for JWT token signing (use a secure random string)

## Post-Deployment Setup

1. The database will be automatically initialized on first API call
2. Default test accounts will be created:
   - admin@acme.test / admin@globex.test (Admin role)
   - user@acme.test / user@globex.test (Member role)
   - Password for all accounts: `password`

## Testing

Visit your deployed URL and test with the provided accounts. The application includes:
- Health endpoint: `GET /health`
- Login functionality
- Notes CRUD operations
- Subscription upgrade (Admin only)
- CORS enabled for automated testing

## Database

- Uses SQLite with better-sqlite3
- Database file is created automatically
- Includes proper multi-tenant isolation
- Foreign key constraints ensure data integrity
