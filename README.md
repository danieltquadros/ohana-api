# 🍣 Ohana Sushi API

[![CI Status](https://github.com/danieltquadros/ohana-api/actions/workflows/ci.yml/badge.svg)](https://github.com/danieltquadros/ohana-api/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-red.svg)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.2-teal.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> Modern REST API for Ohana Sushi menu management system - Built with NestJS, Prisma 7, and PostgreSQL

**Status:** 🚧 Early Development - MVP in Progress

---

## 📋 Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development Guidelines](#development-guidelines)
- [Roadmap](#roadmap)

---

## 🎯 About

Ohana Sushi API is a modern, scalable REST API designed to manage a sushi restaurant's menu system. Built with enterprise-grade technologies and best practices, this project demonstrates:

- ✅ Clean Architecture with dependency injection
- ✅ Database-first design with Prisma ORM
- ✅ Comprehensive unit testing (Jest)
- ✅ Automated CI/CD pipeline
- ✅ Type-safe development with TypeScript
- ✅ Input validation and error handling

**Project Origin:** Brazilian restaurant digitalization initiative

---

## 🚀 Tech Stack

### Core Technologies

- **[NestJS 11](https://nestjs.com/)** - Progressive Node.js framework
- **[TypeScript 5.7](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Prisma 7](https://www.prisma.io/)** - Next-generation ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Production database (via Prisma Postgres)

### Development & Quality

- **[Jest](https://jestjs.io/)** - Testing framework
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD automation
- **[class-validator](https://github.com/typestack/class-validator)** - DTO validation

---

## ✨ Features

### Implemented ✅

- **Products Management**
  - Full CRUD operations
  - Rich product data (title, image, price, order)
  - Ingredient relationships
  - Product type categorization
- **Product Types System**
  - Dynamic product categories (database-driven)
  - Previously enum-based, migrated to relational table for flexibility
- **Data Validation**
  - Input validation with DTOs
  - Type safety throughout the application
- **Testing Infrastructure**
  - Unit tests for all service methods
  - Mocked dependencies for isolated testing
  - 9 tests passing (100% service coverage)
- **CI/CD Pipeline**
  - Automated testing on push/PR
  - Linting and build verification
  - Quality gates enforced

### In Progress 🚧

- E2E tests for API endpoints
- GraphQL layer (alongside REST)
- Authentication & authorization
- Order management system

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or pnpm
- PostgreSQL database (or use Prisma Postgres)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/danieltquadros/ohana-api.git
   cd ohana-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   # Create .env file
   cp .env.example .env

   # Add your database connection string
   DATABASE_URL="your-postgresql-connection-string"
   ```

4. **Generate Prisma Client**

   ```bash
   npx prisma generate
   ```

5. **Run database migrations**

   ```bash
   npx prisma migrate dev
   ```

6. **Seed the database** (optional)

   ```bash
   npx prisma db seed
   ```

7. **Start the development server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`

---

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### Current Test Coverage

- **Unit Tests:** 9 passing
- **Coverage:** 100% of ProductsService methods
- **Test Strategy:** Mock-based unit testing with Jest

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000
```

### Endpoints

#### Products

| Method | Endpoint        | Description                      |
| ------ | --------------- | -------------------------------- |
| GET    | `/products`     | List all products with relations |
| GET    | `/products/:id` | Get product by ID                |
| POST   | `/products`     | Create new product               |
| PATCH  | `/products/:id` | Update product                   |
| DELETE | `/products/:id` | Delete product                   |

#### Example: Create Product

```bash
POST /products
Content-Type: application/json

{
  "title": "Combo Salmão",
  "image": "combo-salmao.jpg",
  "price": 45.00,
  "order": 1,
  "productTypeId": 1,
  "ingredients": [
    { "name": "Salmão", "quantity": 10 },
    { "name": "Cream Cheese", "quantity": 2 }
  ]
}
```

---

## 📁 Project Structure

```
ohana-api/
├── src/
│   ├── prisma/           # Prisma service & module
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── products/         # Products feature module
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── entities/     # Domain entities
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── products.module.ts
│   │   └── *.spec.ts     # Unit tests
│   ├── app.module.ts     # Root module
│   └── main.ts           # Application entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Migration history
│   └── seed.ts           # Database seeding
├── test/                 # E2E tests
├── .github/
│   └── workflows/
│       └── ci.yml        # CI/CD pipeline
├── DEVELOPMENT_GUIDELINES.md
└── README.md
```

---

## 📖 Development Guidelines

This project follows strict development guidelines to ensure code quality, security, and maintainability. Key principles:

- **No `as any` casts** - Type safety is non-negotiable
- **Test-driven development** - Code and tests evolve together
- **Security first** - Environment variables, no hardcoded secrets
- **Production-ready from day one** - All code considers deployment

See [DEVELOPMENT_GUIDELINES.md](DEVELOPMENT_GUIDELINES.md) for the complete guide.

---

## 🔮 Roadmap

### Next Steps (Priority Order)

1. **E2E Tests** - Complete API testing coverage
2. **GraphQL Layer** - Add GraphQL alongside REST
3. **Authentication** - JWT-based auth system
4. **Order Management** - Shopping cart and order processing
5. **Admin Panel** - Angular-based admin interface
6. **Deployment** - Deploy to Render.com with CI/CD
7. **Environment Separation** - Proper DEV/STAGING/PRD environments

### Future Enhancements

- Real-time updates with WebSockets
- Image upload to cloud storage
- Multi-language support
- Analytics dashboard
- Integration with payment gateways

---

## 🤝 Contributing

This is a personal portfolio project, but feedback and suggestions are welcome! Feel free to:

- Open issues for bugs or suggestions
- Fork and experiment
- Reach out with questions

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👤 Author

**Daniel Quadros**

- GitHub: [@danieltquadros](https://github.com/danieltquadros)
- Project: [Ohana Sushi API](https://github.com/danieltquadros/ohana-api)

---

<div align="center">
  
**⭐ If you find this project interesting, please consider giving it a star!**

Made with ❤️ using NestJS, Prisma, and TypeScript

</div>

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
