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
  GUEST       // Cliente sem cadastro - checkout rápido apenas com telefone
}
```

**Permissões por Role:**

| Ação                  | SUPER_ADMIN | ADMIN | STAFF       | USER | GUEST |
| --------------------- | ----------- | ----- | ----------- | ---- | ----- |
| Criar/deletar admins  | ✅          | ❌    | ❌          | ❌   | ❌    |
| Gerenciar produtos    | ✅          | ✅    | ❌          | ❌   | ❌    |
| Processar pedidos     | ✅          | ✅    | ✅          | ❌   | ❌    |
| Visualizar relatórios | ✅          | ✅    | ⚠️ Limitado | ❌   | ❌    |
| Fazer pedidos         | ✅          | ✅    | ✅          | ✅   | ✅    |
| Login com senha       | ✅          | ✅    | ✅          | ✅   | ❌    |
| Histórico completo    | ✅          | ✅    | ✅          | ✅   | ⚠️    |

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
  email     String? @unique  // Opcional para GUEST (apenas telefone)
  password  String?          // Opcional para GUEST (pode converter para USER depois)
  firstName String
  lastName  String
  phone     String  @unique  // Obrigatório - identificador principal do GUEST
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

### 👤 Sistema GUEST - Checkout sem Cadastro

**Motivação:** Reduzir fricção no checkout, permitindo pedidos apenas com telefone (inspirado em iFood, ClickBus).

**Características do GUEST:**

- ✅ Pode fazer pedidos imediatamente (status `ACTIVE` por padrão)
- ✅ Identificado apenas por **telefone** (único e obrigatório)
- ❌ Não possui email nem senha
- ❌ Não pode fazer login
- ✅ Pode ser **convertido** para USER completo depois
- ✅ Telefone duplicado retorna usuário existente (não dá erro)

**Diferenças GUEST vs USER:**

| Campo      | GUEST              | USER                   |
| ---------- | ------------------ | ---------------------- |
| `email`    | `null`             | Obrigatório            |
| `password` | `null`             | Obrigatório (hash)     |
| `phone`    | Obrigatório        | Obrigatório            |
| `role`     | `GUEST`            | `USER`                 |
| `status`   | `ACTIVE`           | `PENDING_VERIFICATION` |
| Login      | ❌ Bloqueado       | ✅ Permitido           |
| Pedidos    | ✅ Pode fazer      | ✅ Pode fazer          |
| Histórico  | ⚠️ Busca por phone | ✅ Completo por userId |

**Fluxo de Conversão GUEST → USER:**

```
1. Cliente faz pedido como GUEST
   └─ { phone, firstName, lastName }
   └─ Recebe JWT com phone no payload

2. Cliente decide criar conta completa
   └─ POST /auth/convert-to-user
   └─ { email, password }
   └─ Mantém mesmo userId e histórico de pedidos

3. Sistema converte GUEST → USER
   ├─ Adiciona email e password
   ├─ Muda role: GUEST → USER
   ├─ Muda status: ACTIVE → PENDING_VERIFICATION
   └─ Gera novo JWT com email no payload

4. Cliente agora pode fazer login
   └─ POST /auth/login com email/password
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

Registra novo usuário completo (USER).

**Body:**

```json
{
  "email": "cliente@example.com",
  "password": "senha123",
  "firstName": "João",
  "lastName": "Silva",
  "phone": "(11) 98765-4321" // Obrigatório
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
    "role": "USER",
    "status": "PENDING_VERIFICATION",
    "createdAt": "2026-02-19T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**

- `409`: Email/phone/CPF já existe
- `400`: Validação falhou (formato inválido)

---

### 2. **POST** `/auth/guest` 🆕

Cria usuário GUEST para checkout rápido (sem email/senha).

**Body:**

```json
{
  "phone": "(51) 98888-7777",
  "firstName": "Maria",
  "lastName": "Silva"
}
```

**Response 201:**

```json
{
  "user": {
    "id": 2,
    "phone": "(51) 98888-7777",
    "firstName": "Maria",
    "lastName": "Silva",
    "role": "GUEST",
    "status": "ACTIVE"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Comportamento Especial:**

- Se telefone já existe como GUEST: retorna usuário existente com novo token
- Se telefone já existe como USER/ADMIN: erro 409 "Please login"
- Token JWT contém `phone` ao invés de `email` no payload

**Errors:**

- `409`: Telefone pertence a USER existente
- `400`: Formato de telefone inválido (deve ser `(XX) XXXXX-XXXX`)

---

### 3. **POST** `/auth/login`

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

### 3. **POST** `/auth/login`

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
- `401`: GUEST tentando fazer login (não tem senha)

**Comportamento:**

- Atualiza `lastLoginAt` automaticamente
- Token expira em 7 dias (default)
- **GUEST users bloqueados:** "Guest users cannot login. Please register an account first."

---

### 4. **POST** `/auth/convert-to-user` 🔒 🆕

Converte usuário GUEST em USER completo, adicionando email/senha. **Requer token JWT** (do GUEST).

**Headers:**

```
Authorization: Bearer <token-do-guest>
```

**Body:**

```json
{
  "email": "maria@example.com",
  "password": "senha123"
}
```

**Response 200:**

```json
{
  "user": {
    "id": 2,
    "email": "maria@example.com",
    "firstName": "Maria",
    "lastName": "Silva",
    "phone": "(51) 98888-7777",
    "role": "USER",
    "status": "PENDING_VERIFICATION"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..." // Novo token com email
}
```

**Comportamento:**

- Mantém mesmo `userId` (preserva histórico de pedidos)
- Muda role `GUEST` → `USER`
- Muda status `ACTIVE` → `PENDING_VERIFICATION`
- Adiciona email e password (hash bcrypt)
- Novo token JWT tem `email` ao invés de `phone`
- Usuário agora pode fazer login normalmente

**Errors:**

- `401`: Token inválido ou ausente
- `409`: Email já está em uso
- `409`: Usuário não é GUEST (já foi convertido)

---

### 5. **GET** `/auth/profile` 🔒

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

### Fluxo de Registro (USER Completo)

```
1. Cliente envia: POST /auth/register
  └─ { email, password, firstName, lastName, phone }

2. Controller valida DTO (formato dos campos)

3. Service verifica:
  ├─ Email já existe? → 409 Conflict
  └─ Phone já existe? → 409 Conflict

4. Service hash password (bcrypt)

5. Cria usuário no banco:
  ├─ role: USER (default)
  └─ status: PENDING_VERIFICATION

6. Gera token JWT:
  └─ payload: { email, sub: userId, role }

7. Retorna: { user, accessToken }
```

### Fluxo de GUEST (Checkout Rápido) 🆕

```
1. Cliente envia: POST /auth/guest
  └─ { phone, firstName, lastName }

2. Controller valida DTO (formato do telefone)

3. Service verifica:
  ├─ Phone já existe como GUEST?
  │  └─ SIM: Retorna usuário existente com novo token
  └─ Phone já existe como USER/ADMIN?
     └─ SIM: 409 "User with this phone already exists. Please login."

4. Cria usuário GUEST no banco:
  ├─ email: null
  ├─ password: null
  ├─ role: GUEST
  └─ status: ACTIVE (pode fazer pedidos imediatamente)

5. Gera token JWT:
  └─ payload: { phone, sub: userId, role: GUEST }

6. Retorna: { user, accessToken }
```

### Fluxo de Conversão GUEST → USER 🆕

```
1. GUEST envia: POST /auth/convert-to-user
  ├─ Header: Authorization: Bearer <token-guest>
  └─ Body: { email, password }

2. JwtAuthGuard valida token (extrai userId)

3. Service verifica:
  ├─ Usuário existe? → 401 if not
  ├─ Role = GUEST? → 409 "User is not a GUEST" if not
  └─ Email disponível? → 409 if exists

4. Service hash password (bcrypt)

5. Atualiza usuário no banco:
  ├─ email: <novo-email>
  ├─ password: <hash>
  ├─ role: GUEST → USER
  └─ status: ACTIVE → PENDING_VERIFICATION

6. Gera novo token JWT:
  └─ payload: { email, sub: userId, role: USER }

7. Retorna: { user, accessToken }

8. Cliente agora pode fazer login com email/senha
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

- [ ] **GUEST Email Capture:** Capturar email opcional durante pedido GUEST
- [ ] **GUEST History:** Interface para GUEST consultar pedidos por phone+código
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
- **Status default**: `PENDING_VERIFICATION` para USER, `ACTIVE` para GUEST
- **Token expiration**: Configurável via `JWT_EXPIRES_IN` no `.env`
- **CORS**: Configure `CORS_ORIGIN` para permitir frontend
- **GUEST Token**: Contém `phone` ao invés de `email` no payload
- **Phone Format**: Obrigatório formato `(XX) XXXXX-XXXX` para Brasil

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

### Erro: "Guest users cannot login"

**Explicação:** GUEST não tem senha, não pode fazer login.

**Solução:**

- Use o token recebido em `POST /auth/guest` diretamente
- Ou converta para USER: `POST /auth/convert-to-user`

---

**Última atualização:** 19/02/2026  
**Versão:** 2.0.0 (GUEST System)
