# 🏗️ SevaSetu - Urban Governance Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**SevaSetu** is a premium, high-performance urban governance platform designed to bridge the gap between citizens and municipal authorities. It provides a seamless, transparent, and efficient way to manage grievances, track public services, and ensure accountable governance.

---

## ✨ Key Features

### 👥 For Citizens
- **🚀 Rapid Grievance Filing**: Submit issues with location tagging, image uploads, and descriptive details.
- **📍 Real-time Tracking**: Monitor the progress of your grievances through a live resolution timeline.
- **🛡️ Secure Identity**: Multi-factor authentication and secure digital identity verification.
- **📊 Personal Dashboard**: Personalized view of all submissions, status updates, and municipal announcements.

### 👮 For Officers & Dept Heads
- **📋 Smart Case Management**: Automated grievance routing and intelligent task prioritization.
- **⏱️ SLA Compliance**: Real-time alerts for pending cases and automated escalation workflows.
- **📈 Advanced Analytics**: Comprehensive heatmaps and data-driven insights into urban problem areas.
- **🚛 Resource Management**: Track municipal vehicles and personnel assigned to field-heavy tasks.

### ⚙️ For Administrators
- **🔑 Granular RBAC**: Role-Based Access Control for citizens, officers, and department heads.
- **📝 Global Audit Logs**: Every system action is logged for maximum transparency and accountability.
- **🛠️ System Configuration**: Dynamic management of municipal departments, regions, and SLA rules.

---

## 🚀 Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend**: Next.js API Routes, [Prisma ORM](https://www.prisma.io/)
- **Database**: SQLite (Development) / PostgreSQL (Production ready)
- **Auth**: JWT-based secure session management with Bcrypt hashing
- **UI/UX**: Custom-built premium components with high responsiveness

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jugal-ahir/SevaSetu.git
   cd sevasetu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="generate-a-strong-secret-here"
   ```

4. **Database Initialization**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📁 Project Structure

```text
sevasetu/
├── src/
│   ├── app/                # Next.js App Router (Pages & API)
│   ├── components/         # Premium UI Components
│   ├── lib/                # Shared logic, Prisma client, Utilities
│   └── services/           # Business logic layers
├── prisma/                 # Database schema & migrations
├── public/                 # Optimized static assets
└── .github/                # GitHub Actions & workflows
```

---

## 🛡️ Security & Scalability

SevaSetu is built with security first:
- **XSS/CSRF Protection**: Built-in Next.js security headers.
- **Rate Limiting**: Protection against brute-force attacks on sensitive routes.
- **Input Sanitization**: Strict Zod validation for all API payloads.
- **Auditable**: Complete traceability of all grievance state changes.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  <b>Built with ❤️ for Smarter Urban Governance</b>
</p>
