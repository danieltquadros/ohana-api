# 🔐 Authentication & User Management - Ohana API

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [User Model Profissional](#user-model-profissional)
3. [Arquitetura de Autenticação](#arquitetura-de-autenticação)
4. [Configuração](#configuração)
5. [Endpoints Disponíveis](#endpoints-disponíveis)
6. [Como Testar](#como-testar)
7. [Fluxos de Autenticação](#fluxos-de-autenticação)

---

## 🎯 Visão Geral

Sistema completo de autenticação JWT com hierarquia de roles, auditoria e soft delete.

### Tecnologias

- **JWT (JSON Web Tokens)**: Autenticação stateless
- **bcrypt**: Hash seguro de senhas
- **Passport.js**: Middleware de autenticação
- **class-validator**: Validação de DTOs
- **Prisma**: ORM para PostgreSQL

---

## 👤 User Model Profissional

### Hierarquia de Roles

```typescript
enum UserRole {
  SUPER_ADMIN // Dono/Gerente - controle total
  ADMIN       // Funcionário admin - gerencia produtos, pedidos
  STAFF       // Funcionário operacional - processa pedidos
  USER        // Cliente - faz pedidos
}
```

**Permissões por Role:**

| Ação                  | SUPER_ADMIN | ADMIN | STAFF       | USER |
| --------------------- | ----------- | ----- | ----------- | ---- |
| Criar/deletar admins  | ✅          | ❌    | ❌          | ❌   |
| Gerenciar produtos    | ✅          | ✅    | ❌          | ❌   |
| Processar pedidos     | ✅          | ✅    | ✅          | ❌   |
| Visualizar relatórios | ✅          | ✅    | ⚠️ Limitado | ❌   |
| Fazer pedidos         | ✅          | ✅    | ✅          | ✅   |

### Status do Usuário

```typescript
enum UserStatus {
  ACTIVE                 // Ativo - pode usar o sistema
  INACTIVE               // Inativo - pode reativar
  SUSPENDED              // Suspenso - bloqueado temporariamente
  PENDING_VERIFICATION   // Aguardando verificação de email
}
```

### Campos do User

```prisma
model User {
  // Identificação
  id        Int
  email     String  @unique
  password  String  // Hash bcrypt
  firstName String
  lastName  String
  phone     String? @unique  // Format: (XX) XXXXX-XXXX
  cpf       String? @unique  // Format: XXX.XXX.XXX-XX

  // Permissões e Status
  role   UserRole   @default(USER)
  status UserStatus @default(PENDING_VERIFICATION)

  // Timestamps
  createdAt       DateTime
  updatedAt       DateTime
  lastLoginAt     DateTime?  // Atualizado a cada login
  emailVerifiedAt DateTime?  // Quando email foi verificado

  // Auditoria (quem criou/editou)
  createdById Int?
  updatedById Int?
  createdBy   User? @relation("UserCreatedBy")
  updatedBy   User? @relation("UserUpdatedBy")

  // Soft Delete
  deletedAt   DateTime?
  deletedById Int?
  deletedBy   User? @relation("UserDeletedBy")
}
```

### Recursos de Segurança

1. **Hash de Senha**: bcrypt com salt rounds = 10
2. **Índices de Performance**: email, cpf, phone, role, status
3. **Validação de Formato**:
   - Email válido
   - Senha mínimo 6 caracteres
   - Phone: `(XX) XXXXX-XXXX`
   - CPF: `XXX.XXX.XXX-XX`
4. **Soft Delete**: Não remove do banco, apenas marca como deletado
5. **Auditoria Completa**: Rastreia quem criou/editou cada usuário

---

## 🏗️ Arquitetura de Autenticação

### Fluxo de Componentes

```
Client Request
     ↓
Controller (auth.controller.ts)
  - Define rotas
  - Valida entrada (DTOs)
     ↓
Service (auth.service.ts)
  - Lógica de negócio
  - Hash de senha
  - Gera JWT token
     ↓
Prisma Service
  - Acessa PostgreSQL
     ↓
Database (users table)
```

### Componentes

#### 1. **DTOs (Data Transfer Objects)**

**`login.dto.ts`**

```typescript
class LoginDto {
  email: string; // Validado como email
  password: string; // Mínimo 6 caracteres
}
```

**`register.dto.ts`**

```typescript
class RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string; // Opcional, formato validado
  cpf?: string; // Opcional, formato validado
}
```

#### 2. **Controller (auth.controller.ts)**

Responsabilidades:

- Definir rotas (`POST /auth/register`, `POST /auth/login`, `GET /auth/profile`)
- Validar entrada usando DTOs
- Proteger rotas com Guards (`@UseGuards(JwtAuthGuard)`)
- Retornar respostas HTTP

```typescript
@Controller('auth')
export class AuthController {
  @Post('register') // Rota pública
  async register(@Body() dto: RegisterDto) {}

  @Post('login') // Rota pública
  async login(@Body() dto: LoginDto) {}

  @UseGuards(JwtAuthGuard) // Rota protegida
  @Get('profile')
  async getProfile(@Request() req) {}
}
```

#### 3. **Service (auth.service.ts)**

Responsabilidades:

- Validar credenciais
- Hash de senhas
- Gerar tokens JWT
- Verificar unicidade (email, phone, cpf)
- Atualizar lastLoginAt
- Regras de negócio

```typescript
@Injectable()
export class AuthService {
  // Cria usuário, hash password, gera token
  async register(dto: RegisterDto) {}

  // Valida credenciais, gera token, atualiza lastLoginAt
  async login(dto: LoginDto) {}

  // Busca perfil completo do usuário
  async getProfile(userId: number) {}
}
```

#### 4. **JWT Strategy (jwt.strategy.ts)**

Responsabilidades:

- Validar token JWT
- Extrair dados do token
- Buscar usuário no banco
- Disponibilizar em `req.user`

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: any) {
    // payload = { email, sub (userId), role }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    return user; // Fica disponível em req.user
  }
}
```

#### 5. **JWT Guard (jwt-auth.guard.ts)**

Responsabilidades:

- Interceptar requisições em rotas protegidas
- Extrair token do header `Authorization: Bearer <token>`
- Chamar JwtStrategy para validar
- Bloquear acesso se token inválido

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Uso:
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile() {
  // Só executa se token válido
}
```

---

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/bcrypt @types/passport-jwt
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

**Gere JWT_SECRET seguro:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Adicione ao `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ohana_db"
JWT_SECRET="SEU_SECRET_GERADO_AQUI"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
PORT=3000
```

### 3. Executar Migrations

```bash
npx prisma migrate dev
```

### 4. Gerar Prisma Client

```bash
npx prisma generate
```

---

## 🚀 Endpoints Disponíveis

### Base URL: `http://localhost:3000/api/auth`

---

### 1. **POST** `/auth/register`

Registra novo usuário.

**Body:**

```json
{
  "email": "cliente@example.com",
  "password": "senha123",
  "firstName": "João",
  "lastName": "Silva",
  "phone": "(11) 98765-4321", // Opcional
  "cpf": "123.456.789-00" // Opcional
}
```

**Response 201:**

```json
{
  "user": {
    "id": 1,
    "email": "cliente@example.com",
    "firstName": "João",
    "lastName": "Silva",
    "phone": "(11) 98765-4321",
    "cpf": "123.456.789-00",
    "role": "USER",
    "status": "PENDING_VERIFICATION",
    "createdAt": "2026-02-17T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**

- `409`: Email/phone/CPF já existe
- `400`: Validação falhou (formato inválido)

---

### 2. **POST** `/auth/login`

Faz login e retorna token JWT.

**Body:**

```json
{
  "email": "cliente@example.com",
  "password": "senha123"
}
```

**Response 200:**

```json
{
  "user": {
    "id": 1,
    "email": "cliente@example.com",
    "firstName": "João",
    "lastName": "Silva",
    "phone": "(11) 98765-4321",
    "role": "USER",
    "status": "ACTIVE"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**

- `401`: Credenciais inválidas
- `401`: Usuário inativo ou suspenso

**Comportamento:**

- Atualiza `lastLoginAt` automaticamente
- Token expira em 7 dias (default)

---

### 3. **GET** `/auth/profile` 🔒

Retorna perfil do usuário autenticado. **Requer token JWT**.

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response 200:**

```json
{
  "id": 1,
  "email": "cliente@example.com",
  "firstName": "João",
  "lastName": "Silva",
  "phone": "(11) 98765-4321",
  "cpf": "123.456.789-00",
  "role": "USER",
  "status": "ACTIVE",
  "createdAt": "2026-02-17T10:00:00.000Z",
  "updatedAt": "2026-02-17T10:00:00.000Z",
  "lastLoginAt": "2026-02-17T11:30:00.000Z",
  "emailVerifiedAt": null
}
```

**Errors:**

- `401`: Token inválido ou expirado
- `401`: Usuário não encontrado

---

## 🧪 Como Testar

### Opção 1: Thunder Client (VS Code)

1. Instale extensão **Thunder Client**
2. Crie uma **New Request**
3. Siga exemplos abaixo

### Opção 2: Postman

1. Abra Postman
2. Importe collection ou crie requests manualmente

### Opção 3: cURL

```bash
# Registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@ohana.com",
    "password": "senha123",
    "firstName": "Teste",
    "lastName": "Ohana"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@ohana.com",
    "password": "senha123"
  }'

# Perfil (substitua TOKEN pelo accessToken recebido)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

---

## 🔄 Fluxos de Autenticação

### Fluxo de Registro

```
1. Cliente envia: POST /auth/register
  └─ { email, password, firstName, lastName }

2. Controller valida DTO (formato dos campos)

3. Service verifica:
  ├─ Email já existe? → 409 Conflict
  ├─ Phone já existe? → 409 Conflict
  └─ CPF já existe? → 409 Conflict

4. Service hash password (bcrypt)

5. Cria usuário no banco:
  ├─ role: USER (default)
  └─ status: PENDING_VERIFICATION

6. Gera token JWT:
  └─ payload: { email, sub: userId, role }

7. Retorna: { user, accessToken }
```

### Fluxo de Login

```
1. Cliente envia: POST /auth/login
  └─ { email, password }

2. Controller valida DTO

3. Service busca usuário por email

4. Service verifica:
  ├─ Usuário existe? → 401 Unauthorized
  ├─ Status = ACTIVE? → 401 if not
  └─ Password válido? → 401 if not

5. Atualiza lastLoginAt timestamp

6. Gera token JWT

7. Retorna: { user, accessToken }
```

### Fluxo de Requisição Protegida

```
1. Cliente envia: GET /auth/profile
  └─ Header: Authorization: Bearer <token>

2. JwtAuthGuard intercepta

3. Extrai token do header

4. JwtStrategy valida token:
  ├─ Token válido?
  ├─ Não expirado?
  └─ Assinatura correta?

5. JwtStrategy busca usuário:
  └─ User status = ACTIVE?

6. Disponibiliza em req.user

7. Controller acessa req.user.id

8. Service busca perfil completo

9. Retorna dados do usuário
```

---

## 🛡️ Segurança

### Boas Práticas Implementadas

1. **Hash de Senha**: bcrypt com 10 salt rounds
2. **JWT Secret Forte**: 32 bytes aleatórios
3. **Tokens com Expiração**: 7 dias default
4. **Validação de Entrada**: class-validator em todos DTOs
5. **Índices no Banco**: Performance otimizada
6. **Soft Delete**: Preserva histórico de auditoria
7. **Status Checking**: Verifica se usuário está ativo
8. **Unique Constraints**: Previne duplicatas (email, phone, cpf)

### Melhorias Futuras

- [ ] Rate Limiting (evitar brute force)
- [ ] Refresh Tokens (renovar sem relogin)
- [ ] Email Verification (confirmar email)
- [ ] Two-Factor Authentication (2FA)
- [ ] Password Reset (recuperação de senha)
- [ ] Session Management (invalidar tokens)
- [ ] Audit Logs (registrar todas ações)

---

## 📝 Notas

- **Primeiro usuário**: Registra como `USER`, mude para `SUPER_ADMIN` manualmente no banco
- **Status default**: `PENDING_VERIFICATION` (implementar verificação de email depois)
- **Token expiration**: Configurável via `JWT_EXPIRES_IN` no `.env`
- **CORS**: Configure `CORS_ORIGIN` para permitir frontend

---

## 🐛 Troubleshooting

### Erro: "Property 'user' does not exist on type 'PrismaService'"

**Solução:**

```bash
npx prisma generate
# Reinicie TypeScript server no VS Code
```

### Erro: "Token expired"

**Solução:**

- Faça login novamente para obter novo token
- Ou configure `JWT_EXPIRES_IN` para duração maior

### Erro: "User with this email already exists"

**Solução:**

- Use email diferente
- Ou limpe banco: `npx prisma migrate reset`

---

**Última atualização:** 17/02/2026  
**Versão:** 1.0.0
