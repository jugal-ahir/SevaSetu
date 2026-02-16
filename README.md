# SevaSetu - Urban Governance Platform

## Overview
SevaSetu is a comprehensive urban governance web application that bridges the gap between citizens and municipal authorities, enabling seamless grievance management, real-time service tracking, and transparent governance.

## Features

### For Citizens
- **Submit Grievances**: Report urban issues with location, images, and detailed descriptions
- **Track Status**: Monitor grievance resolution through a visual timeline
- **Identity Verification**: Secure digital identity verification
- **Dashboard**: View statistics and recent submissions

### For Officers
- **Case Management**: View and manage assigned grievances
- **Status Updates**: Update case status and add notes
- **SLA Tracking**: Monitor overdue cases and compliance

### For Administrators
- **User Management**: Manage all system users and roles
- **Department Management**: Configure departments and assignments
- **Analytics**: System-wide statistics and performance metrics
- **Audit Logs**: Complete audit trail of all actions

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS v4
- **Authentication**: JWT-based with bcrypt
- **Icons**: Heroicons
- **Fonts**: Inter

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Configure database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

### Environment Variables

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
```

## Project Structure

```
sevasetu/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── citizen/           # Citizen dashboard & features
│   │   ├── officer/           # Officer dashboard & features
│   │   ├── admin/             # Admin dashboard & features
│   │   └── api/               # API routes
│   ├── components/            # Reusable components
│   ├── lib/                   # Utilities and helpers
│   └── generated/             # Prisma client
├── prisma/
│   └── schema.prisma          # Database schema
└── public/                    # Static assets
```

## Database Schema

Key models:
- **User**: Citizens, officers, department heads, and admins
- **Grievance**: Citizen-submitted issues
- **Department**: Municipal departments
- **Region**: Geographic regions
- **Vehicle**: Municipal vehicles for tracking
- **AuditLog**: Complete audit trail
- **SlaRule**: Service level agreement rules

## User Roles

1. **CITIZEN**: Submit and track grievances
2. **OFFICER**: Manage assigned cases
3. **DEPT_HEAD**: Department oversight and analytics
4. **ADMIN/SUPER_ADMIN**: Full system administration

## Security

- JWT-based authentication
- Password hashing with bcrypt (10 rounds)
- Role-based access control
- Audit logging for critical actions
- Input validation with Zod
- Secure HTTP-only cookies

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Deployment

The application can be deployed to:
- Vercel (recommended for Next.js)
- Railway
- AWS/GCP/Azure
- Any Node.js hosting platform

## Contributing

This is a complete, production-ready application. For enhancements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open an issue on the repository.

---

**Built with ❤️ for better urban governance**
