# Plano de Ação - Ohana API

## 📊 Status Atual do Projeto

### ✅ Concluído

**Infraestrutura Base:**

- ✅ NestJS 11 + TypeScript
- ✅ PostgreSQL + Prisma ORM (adapter-pg)
- ✅ GraphQL (Apollo Server) + REST API
- ✅ ESLint + Prettier + Husky
- ✅ GitHub Actions CI/CD

**Módulos CRUD:**

- ✅ Products, Product Types, Categories, Ingredients, Combos
- ✅ REST + GraphQL completos

**Testes:**

- ✅ 65 testes unitários passando
- ✅ E2E Tests criados e funcionando

**Git:**

- ✅ PR #1 mergeado na `main`
- ✅ Branch `feature/complete-crud-modules` integrada

---

## 🏗️ Arquitetura de Ambientes

### Situação Atual (Produção Ativa)

```
PRODUÇÃO (www.ohanasushidelivery.com.br):
├─ Frontend: Next.js + Prisma
│  └─ PostgreSQL próprio (dados locais)
└─ Backend: NÃO EXISTE (frontend usa dados próprios)
```

### Objetivo Final

```
┌─────────────────────────────────────────────────────────┐
│                     DESENVOLVIMENTO                     │
├─────────────────────────────────────────────────────────┤
│ Frontend DEV                                            │
│ ├─ URL: dev.ohanasushidelivery.com.br                  │
│ ├─ Branch: development                                  │
│ ├─ Deploy: Vercel (preview ou custom domain)           │
│ └─ PostgreSQL DEV: Vercel Postgres                     │
│                                                         │
│ Backend DEV                                             │
│ ├─ URL: ohana-api-dev.onrender.com                     │
│ ├─ Branch: main (deploy automático)                    │
│ ├─ Deploy: Render Web Service (Free Tier)              │
│ └─ PostgreSQL DEV: Render PostgreSQL (Free Tier)       │
│                                                         │
│ Sincronização:                                          │
│ └─ Frontend DEV consome Backend DEV                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                       PRODUÇÃO                          │
├─────────────────────────────────────────────────────────┤
│ Frontend PRD                                            │
│ ├─ URL: www.ohanasushidelivery.com.br                  │
│ ├─ Branch: master/main                                  │
│ ├─ Deploy: Vercel                                       │
│ └─ PostgreSQL PRD: Vercel Postgres OU migra pro Render │
│                                                         │
│ Backend PRD                                             │
│ ├─ URL: ohana-api.onrender.com                         │
│ │   (ou api.ohanasushidelivery.com.br via DNS)         │
│ ├─ Branch: main                                         │
│ ├─ Deploy: Render Web Service (Paid Tier)              │
│ └─ PostgreSQL PRD: Render PostgreSQL (Paid, c/ backup) │
│                                                         │
│ Sincronização:                                          │
│ └─ Frontend PRD consome Backend PRD                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Roadmap de Desenvolvimento

### ⚡ FASE 1: Setup Backend DEV (Em Andamento)

**Objetivo:** Backend rodando em ambiente DEV acessível via internet

#### Passo 1.1: Sincronizar Dados ⬅️ **PRÓXIMO**

- [ ] Rodar seed atualizado com preços do frontend
- [ ] Validar dados no banco local

**Comando:**

```bash
cd c:\rep\dtq\ohana\ohana-api
npx ts-node prisma/seed.ts
```

#### Passo 1.2: Provisionar Infraestrutura Render

**1.2.1 - Criar Conta Render**

- [ ] Acessar: https://render.com
- [ ] Sign up com GitHub
- [ ] Conectar repositório `danieltquadros/ohana-api`

**1.2.2 - Criar PostgreSQL DEV**

- [ ] Dashboard → New → PostgreSQL
- [ ] Nome: `ohana-api-dev-db`
- [ ] Region: Oregon (US West)
- [ ] Plano: **Free**
- [ ] Copiar `Internal Database URL` para usar no backend

**1.2.3 - Criar Web Service (Backend)**

- [ ] Dashboard → New → Web Service
- [ ] Repository: `danieltquadros/ohana-api`
- [ ] Nome: `ohana-api-dev`
- [ ] Branch: `main`
- [ ] Region: Oregon (mesma do banco)
- [ ] Build Command: `npm install && npx prisma generate && npm run build`
- [ ] Start Command: `npm run start:prod`
- [ ] Plano: **Free**

**1.2.4 - Configurar Environment Variables**

No dashboard do Web Service, adicionar:

```env
DATABASE_URL=[Copiar do PostgreSQL criado - Internal Database URL]
NODE_ENV=development
PORT=3000
CORS_ORIGIN=https://dev.ohanasushidelivery.com.br,http://localhost:3001
```

**1.2.5 - Executar Migration no Render**

- [ ] Abrir Shell no dashboard do Web Service
- [ ] Executar: `npx prisma migrate deploy`
- [ ] Executar: `npx ts-node prisma/seed.ts` (ou rodar localmente apontando pro DB remoto)

**1.2.6 - Validar Backend DEV**

- [ ] Acessar: `https://ohana-api-dev.onrender.com/api/products`
- [ ] Verificar se retorna JSON com produtos
- [ ] Testar GraphQL: `https://ohana-api-dev.onrender.com/graphql`

---

### 🌐 FASE 2: Setup Frontend DEV

**Objetivo:** Frontend de desenvolvimento consumindo Backend DEV

#### Passo 2.1: Criar Branch Development no Frontend

**Repositório:** `danieltquadros/ohana_sushi`

```bash
cd c:\rep\dtq\ohana\ohana_sushi
git checkout master
git pull origin master
git checkout -b development
```

#### Passo 2.2: Configurar Environment Variable

Criar/atualizar `.env.development`:

```env
NEXT_PUBLIC_API_URL=https://ohana-api-dev.onrender.com
DATABASE_URL=[manter o atual ou criar novo para DEV]
```

#### Passo 2.3: Deploy Frontend DEV

**Opção A - Vercel Preview (Automático):**

- [ ] Push branch `development` para GitHub
- [ ] Vercel automaticamente cria preview: `ohana-sushi-git-development.vercel.app`
- [ ] Acessar e testar

**Opção B - Custom Domain:**

- [ ] Configurar no DNS: `dev.ohanasushidelivery.com.br` → Vercel
- [ ] No Vercel, settings → Domains → Add `dev.ohanasushidelivery.com.br`
- [ ] Associar à branch `development`

#### Passo 2.4: Validar Integração

- [ ] Frontend DEV carrega produtos do Backend DEV
- [ ] CORS funciona corretamente
- [ ] Todas as features principais funcionando

---

### 🔐 FASE 3: Features Essenciais

**Objetivo:** Backend com funcionalidades necessárias para produção

#### 3.1 - Autenticação/Autorização

- [ ] Implementar JWT authentication
- [ ] Roles: Admin, User
- [ ] Proteger endpoints administrativos

#### 3.2 - Upload de Imagens

- [ ] Integração com Cloudinary ou S3
- [ ] Endpoint para upload de imagens de produtos
- [ ] Validação de tipos de arquivo

#### 3.3 - Painel Administrativo (Backend)

- [ ] CRUD de produtos via API
- [ ] Gerenciamento de categorias
- [ ] Gerenciamento de ingredientes
- [ ] Dashboard de pedidos (futuro)

---

### 🚀 FASE 4: Setup Produção

**Objetivo:** Backend PRD estável e robusto

#### 4.1 - Provisionar Infraestrutura PRD no Render

**PostgreSQL PRD:**

- [ ] Criar novo PostgreSQL (Paid Tier com backup)
- [ ] Nome: `ohana-api-prod-db`
- [ ] Plano: Starter ($7/mês - 1GB, backups diários)

**Web Service PRD:**

- [ ] Criar novo Web Service
- [ ] Nome: `ohana-api-prod`
- [ ] Branch: `main`
- [ ] Plano: Starter ($7/mês - 512MB RAM, sempre ativo)

**Environment Variables PRD:**

```env
DATABASE_URL=[PostgreSQL PRD URL]
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://www.ohanasushidelivery.com.br
JWT_SECRET=[gerar secret seguro]
```

#### 4.2 - Custom Domain (Opcional)

- [ ] Configurar DNS: `api.ohanasushidelivery.com.br` → Render
- [ ] Certificado SSL automático

#### 4.3 - Migração de Dados

**Opção A - Script de Migração:**

- [ ] Criar script para copiar dados do frontend para backend
- [ ] Validar integridade dos dados

**Opção B - Dual Database Temporário:**

- [ ] Frontend grava em ambos os bancos
- [ ] Validar consistência
- [ ] Migrar leitura gradualmente

#### 4.4 - Monitoramento

- [ ] Configurar logs estruturados
- [ ] Alertas de erro (email ou Slack)
- [ ] Monitorar performance do banco

---

### 🔄 FASE 5: Switch Final

**Objetivo:** Frontend PRD consumindo Backend PRD

#### 5.1 - Atualizar Frontend PRD

- [ ] Branch `master` do frontend
- [ ] Atualizar `.env.production`:
  ```env
  NEXT_PUBLIC_API_URL=https://api.ohanasushidelivery.com.br
  ```
- [ ] Deploy na Vercel

#### 5.2 - Validação e Rollback Plan

- [ ] Testar todas as funcionalidades em staging
- [ ] Plano de rollback: reverter env var do frontend
- [ ] Manter banco antigo por 30 dias (backup)

#### 5.3 - Go Live

- [ ] Switch de produção em horário de baixo tráfego
- [ ] Monitorar logs e erros
- [ ] Validar fluxo completo de pedidos

#### 5.4 - Desativação do Banco Antigo

- [ ] Após 30 dias de validação
- [ ] Exportar backup final
- [ ] Desativar banco antigo do frontend

---

## 📋 Checklist de Deploy

### Antes de DEV

- [x] Testes unitários passando (65/65)
- [x] Testes E2E principais passando
- [x] Build sem erros
- [x] ESLint passando
- [ ] Seed com dados atualizados do frontend
- [ ] README com instruções de setup

### Antes de PRD

- [ ] Todos os testes E2E com banco real
- [ ] Performance testada (carga, latência)
- [ ] Backup do banco configurado
- [ ] Monitoramento configurado
- [ ] Estratégia de rollback definida
- [ ] Frontend testado com backend em staging
- [ ] Autenticação implementada
- [ ] Upload de imagens funcionando

---

## 🛠️ Comando Rápidos

### Seed (Sincronizar dados do Frontend)

```bash
cd c:\rep\dtq\ohana\ohana-api
npx ts-node prisma/seed.ts
```

### Build Local

```bash
npm run build
```

### Testes

```bash
npm test                    # Testes unitários
npm run test:e2e           # Testes E2E
npm run test:cov           # Coverage
```

### Prisma

```bash
npx prisma generate        # Gerar cliente
npx prisma migrate dev     # Criar migration (dev)
npx prisma migrate deploy  # Aplicar migrations (prod)
npx prisma studio          # UI do banco
```

---

## 📚 Recursos

### Documentação

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)

### Plataformas

- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repo Backend:** https://github.com/danieltquadros/ohana-api
- **GitHub Repo Frontend:** https://github.com/danieltquadros/ohana_sushi

---

**Última atualização:** 12/02/2026  
**Versão:** 1.0.0  
**Próximo passo:** Rodar seed + Setup Render DEV
