# ⚙️ Ohana Sushi API

[![CI Status](https://github.com/danieltquadros/ohana-api/actions/workflows/ci.yml/badge.svg)](https://github.com/danieltquadros/ohana-api/actions/workflows/ci.yml)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> REST API for the Ohana Sushi delivery system.
> Built with NestJS, Prisma 7, and PostgreSQL.

**Status:** 🟢 Production — Live at [ohanasushidelivery.com.br](https://www.ohanasushidelivery.com.br)

---

## 📋 Table of Contents

- [About](#-about)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Project Structure](#%EF%B8%8F-project-structure)
- [Available Scripts](#-available-scripts)
- [Deployment](#%EF%B8%8F-deployment)
- [License](#-license)

---

## 🎯 About

This repository is part of the **Ohana Sushi** project — a full-stack delivery system currently in active commercial use.

The full project consists of three integrated applications:

- 🛒 **[ohana_sushi](https://github.com/danieltquadros/ohana_sushi)** — Customer storefront — Next.js
- ⚙️ **[ohana-api](https://github.com/danieltquadros/ohana-api)** — REST API backend (this repository) — NestJS
- 🎛️ **[ohana-admin](https://github.com/danieltquadros/ohana-admin)** — Admin panel — Angular

This backend exposes a REST API for product catalog, authentication, and offer/menu management.

### Highlights

- ✅ Clean architecture with dependency injection
- ✅ Database-first design with Prisma ORM
- ✅ JWT authentication + RBAC (5 hierarchical levels)
- ✅ 97+ unit tests (Jest)
- ✅ Automated CI/CD pipeline
- ✅ Type-safe development with TypeScript
- ✅ Image upload via Cloudinary
- ✅ Multi-environment deployment (DEV/PRD)

## 🏛️ Architecture

In commercial production since **July 2025**, serving real customers.

```mermaid
flowchart TB
    subgraph Frontends
        STORE["🛒 ohana_sushi<br/>Next.js 14 · Vercel"]
        ADMIN["🎛️ ohana-admin<br/>Angular 21 · Vercel"]
    end

    API["⚙️ ohana-api<br/>NestJS 11 · Render"]

    STORE -->|REST| API
    ADMIN -->|REST| API

    API --> DB[("PostgreSQL<br/>Neon — DEV/PRD isolated")]
    API --> CDN["Cloudinary<br/>image storage"]

    CI["GitHub Actions CI/CD"] -.->|auto-deploy| API
    CI -.->|auto-deploy| STORE
    CI -.->|auto-deploy| ADMIN
```

Two fully isolated environments (DEV and PRD) across the entire stack —
separate databases, API instances, and frontend deployments, promoted
via Git branches.

## 🧭 Key Decisions

**Aggregated `GET /menu` endpoint** — the storefront renders the full
menu from a single call. Menu composition rules live in the backend,
avoiding N+1 requests and keeping business logic out of the client.

**Hierarchical JWT + RBAC (5 levels)** — SUPER_ADMIN → ADMIN → STAFF →
USER → GUEST. The GUEST level enables sign-up-free checkout identified
by phone number, removing the biggest friction point in food delivery.

**Zero-downtime schema migration in production** — column drops, new
table creation, and FK wiring shipped as a single atomic Postgres
migration, with an idempotent seed script.

**Referential integrity on soft delete** — deleting an entity still
referenced elsewhere returns HTTP 409 with context, protecting the
admin from silently breaking the live menu.

## 🛠️ Tech Stack

- **Framework:** NestJS 11
- **Language:** TypeScript
- **ORM:** Prisma 7
- **Database:** PostgreSQL (Neon)
- **Authentication:** JWT + RBAC
- **Image hosting:** Cloudinary
- **Testing:** Jest
- **Deploy:** Render
- **CI/CD:** GitHub Actions + Husky pre-commit hooks

## ✨ Features

- 🛡️ **Authorization:** RBAC with 5 levels (SUPER_ADMIN, ADMIN, STAFF, USER, GUEST)
- 👤 **GUEST system:** Sign-up-free checkout (phone-based identification)
- 📦 **Catalog:** Products, customizable combos, ingredients, categories, types
- 🖼️ **Image upload:** Cloudinary with on-the-fly transformations
- 🔒 **Data integrity:** Referential integrity validation on soft-delete (HTTP 409)
- 📚 **Documentation:** Technical docs versioned in `docs/`

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (or use Neon free tier)
- Cloudinary account (free tier)

### Installation

```bash
git clone https://github.com/danieltquadros/ohana-api.git
cd ohana-api
npm install
```

### Database setup

```bash
npx prisma migrate dev
npx prisma db seed
```

### Running locally

```bash
npm run start:dev
```

API will be available at [http://localhost:3000](http://localhost:3000).

## 🌐 Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

PORT=3000

CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

## 🧪 Testing

```bash
npm run test         # unit tests
npm run test:watch   # watch mode
npm run test:cov     # coverage report
```

Currently 97+ unit tests covering services and controllers.

## 🏗️ Project Structure

```
src/
├── auth/            # JWT, guards, decorators, RBAC
├── products/        # Product CRUD
├── combos/          # Combo CRUD with product relations
├── ingredients/     # Ingredient CRUD
├── categories/      # Category CRUD
├── product-types/   # Product type CRUD
├── upload/          # Cloudinary integration
├── prisma/          # Prisma service
└── common/          # Shared enums and utilities
prisma/
├── schema.prisma    # Database schema
└── migrations/      # Versioned migrations
docs/                # Technical documentation
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start dev server with watch mode |
| `npm run build` | Build production bundle |
| `npm run start:prod` | Start production server |
| `npm run test` | Run unit tests |
| `npm run lint` | Run ESLint |

## ☁️ Deployment

- **Production:** Render — auto-deploy on push to `main`
- **Development:** Render — auto-deploy on push to `development`
- **Database:** Neon PostgreSQL (DEV + PRD isolated)
- **Monitoring:** UptimeRobot (scheduled via GitHub Actions for Free Tier optimization)

## 📄 License

MIT
