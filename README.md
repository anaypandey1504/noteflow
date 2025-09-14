# Yardstick SaaS Notes Application

A multi-tenant SaaS Notes Application built with Next.js, deployed on Vercel. This application allows multiple tenants (companies) to securely manage their users and notes with role-based access control and subscription feature gating.

## 🏗️ Multi-Tenancy Approach

This application uses a **shared schema with tenant ID columns** approach for multi-tenancy:

- **Database Schema**: Single database with tenant isolation enforced through `tenant_id` foreign keys
- **Data Isolation**: All data queries include tenant filtering to ensure strict isolation
- **Scalability**: Efficient for moderate tenant counts, easy to migrate to schema-per-tenant or database-per-tenant as needed
- **Benefits**: 
  - Simple deployment and maintenance
  - Cost-effective for smaller applications
  - Easy backup and migration
  - Centralized analytics and monitoring

### Database Schema

```sql
tenants (id, slug, name, subscription_plan, created_at)
users (id, email, password_hash, role, tenant_id, created_at)
notes (id, title, content, tenant_id, user_id, created_at, updated_at)
```

All queries include tenant filtering: `WHERE tenant_id = ?` to ensure data isolation.

## 🚀 Features

### Multi-Tenancy
- Support for multiple tenants (Acme, Globex)
- Strict data isolation between tenants
- Tenant-specific authentication and authorization

### Authentication & Authorization
- JWT-based authentication
- Role-based access control:
  - **Admin**: Can invite users and upgrade subscriptions
  - **Member**: Can create, view, edit, delete notes, and upgrade subscriptions
- Pre-configured test accounts

### Subscription Feature Gating
- **Free Plan**: Limited to 3 notes
- **Pro Plan**: Unlimited notes ($2,000 one-time payment)
- **Payment Integration**: Stripe-powered secure payments
- Upgrade functionality available to all users with beautiful upgrade modal

### Notes CRUD API
- Create, read, update, delete notes
- Tenant-isolated data access
- Role-based permissions

## 🧪 Test Accounts

All test accounts use password: `password`

| Email | Role | Tenant |
|-------|------|--------|
| admin@acme.test | Admin | Acme |
| user@acme.test | Member | Acme |
| admin@globex.test | Admin | Globex |
| user@globex.test | Member | Globex |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Notes
- `POST /api/notes` - Create a note
- `GET /api/notes` - List all notes for current tenant
- `GET /api/notes/:id` - Retrieve a specific note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

### Tenant Management
- `POST /api/tenants/:slug/upgrade` - Upgrade tenant subscription (All users)

### Health Check
- `GET /api/health` - Health endpoint returning `{"status": "ok"}`

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes
- **Database**: JSON-based database (file system)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Payments**: Stripe integration
- **UI/UX**: Modern gradient design, animations, glass morphism
- **Deployment**: Vercel

## 🚀 Deployment

### Prerequisites
1. Node.js 18+ installed
2. Vercel account

### Environment Variables
Set the following environment variables in Vercel:
- `JWT_SECRET`: A secure secret key for JWT signing
- `STRIPE_SECRET_KEY`: Your Stripe secret key for payment processing

### Deploy to Vercel
1. Install dependencies: `npm install`
2. Deploy: `vercel --prod`

The application will be available at your Vercel domain with CORS enabled for automated testing.

## 🏃‍♂️ Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set environment variables:
   ```bash
   export JWT_SECRET="your-secret-key-for-development"
   ```
4. Run development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## 🔒 Security Features

- JWT-based authentication with 24-hour expiration
- Password hashing with bcrypt
- Tenant data isolation at the database level
- Role-based access control
- CORS configuration for secure API access
- Input validation and sanitization

## 📊 Database Initialization

The application automatically initializes the database on first run with:
- Default tenants (Acme, Globex)
- Test user accounts
- Proper schema with foreign key constraints

## 🧪 Testing

The application is designed to work with automated test scripts that verify:
- Health endpoint availability
- Authentication for all test accounts
- Tenant data isolation
- Role-based permissions
- Subscription limits and upgrades
- CRUD operations
- Frontend accessibility

## 📝 License

This project is created for the Yardstick assignment.
