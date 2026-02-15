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

### ✅ FASE 1: Setup Backend DEV (CONCLUÍDA)

**Objetivo:** Backend rodando em ambiente DEV acessível via internet

#### Passo 1.1: Sincronizar Dados

- [x] Rodar seed atualizado com preços do frontend
- [x] Validar dados no banco local

**Comando:**

```bash
cd c:\rep\dtq\ohana\ohana-api
npx ts-node prisma/seed.ts
```

#### Passo 1.2: Provisionar Infraestrutura Render

**1.2.1 - Criar Conta Render**

- [x] Acessar: https://render.com
- [x] Sign up com GitHub
- [x] Conectar repositório `danieltquadros/ohana-api`

**1.2.2 - Criar PostgreSQL DEV**

- [x] Dashboard → New → PostgreSQL
- [x] Nome: `ohana-api-dev-db`
- [x] Region: Oregon (US West)
- [x] Plano: **Free**
- [x] Copiar `Internal Database URL` para usar no backend

**1.2.3 - Criar Web Service (Backend)**

- [x] Dashboard → New → Web Service
- [x] Repository: `danieltquadros/ohana-api`
- [x] Nome: `ohana-api-dev`
- [x] Branch: `main`
- [x] Region: Oregon (mesma do banco)
- [x] Build Command: `npm install && npx prisma generate && npm run build`
- [x] Start Command: `npm run start:prod`
- [x] Plano: **Free**

**1.2.4 - Configurar Environment Variables**

- [x] No dashboard do Web Service, adicionar:
  - DATABASE_URL (Internal Database URL do PostgreSQL)
  - NODE_ENV=development
  - PORT=3000
  - CORS_ORIGIN (URLs do frontend)

**1.2.5 - Executar Migration no Render**

- [x] Executar migrations (auto-deploy faz isso)
- [x] Executar seed localmente apontando para DB remoto (External URL)
- [x] Configurar SSL no Pool para conexões remotas

**1.2.6 - Validar Backend DEV**

- [x] Acessar: `https://ohana-api-dev-a7kk.onrender.com/api/products`
- [x] Verificar se retorna JSON com produtos
- [x] Testar GraphQL: `https://ohana-api-dev-a7kk.onrender.com/graphql`

---

### ✅ FASE 2: Setup Frontend DEV (CONCLUÍDA)

**Objetivo:** Frontend de desenvolvimento consumindo Backend DEV

#### Passo 2.1: Criar Branch Development no Frontend

**Repositório:** `danieltquadros/ohana_sushi`

- [x] Criar branch `development` a partir de `master`
- [x] Commit: `4f975d2`

#### Passo 2.2: Configurar Environment Variable

- [x] Criado `.env.development`:
  ```env
  NEXT_PUBLIC_API_URL=https://ohana-api-dev-a7kk.onrender.com/api
  DATABASE_URL=[mantido temporariamente]
  ```
- [x] Atualizado `services/api.ts` para usar `NEXT_PUBLIC_API_URL`

#### Passo 2.3: Deploy Frontend DEV

- [x] Push branch `development` para GitHub
- [x] Vercel automaticamente criou preview
- [x] URL DEV: https://ohana-sushi-delivery-git-development-danieltquadros-projects.vercel.app/
- [x] URL PRD mantida: https://www.ohanasushidelivery.com.br/

#### Passo 2.4: Validar Integração Básica

- [x] Vercel detectou e deployou branch `development`
- [x] Ambientes DEV e PRD rodando separadamente

---

### 🔄 FASE 3: Migração Database DEV ⬅️ **PRÓXIMA**

**Objetivo:** Frontend DEV consumir 100% do Backend DEV, remover Prisma do frontend DEV

#### 3.1 - Análise do Frontend Atual

- [ ] Identificar todas as queries Prisma no frontend
- [ ] Listar todas as operações de banco: products, categories, ingredients, combos, orders
- [ ] Mapear quais endpoints do backend já existem
- [ ] Identificar endpoints faltantes no backend

#### 3.2 - Garantir Endpoints no Backend DEV

- [ ] Validar endpoints REST:
  - `/api/products` ✅ (já existe)
  - `/api/categories` ✅ (já existe)
  - `/api/ingredients` ✅ (já existe)
  - `/api/combos` ✅ (já existe)
  - `/api/product-types` ✅ (já existe)
- [ ] Criar endpoints adicionais se necessário (orders, cart, etc.)

#### 3.3 - Refatorar Frontend DEV

**Branch:** `development`

- [ ] Substituir todas as queries Prisma por chamadas à API backend
- [ ] Atualizar `services/api.ts` com todas as funções necessárias:
  ```typescript
  // Exemplos:
  export async function fetchProducts();
  export async function fetchCategories();
  export async function fetchIngredients();
  export async function fetchCombos();
  // ... outros conforme necessário
  ```
- [ ] Testar localmente (frontend DEV rodando em localhost, consumindo backend DEV no Render)

#### 3.4 - Remover Prisma do Frontend DEV

- [ ] Remover imports de `@prisma/client` dos componentes/páginas
- [ ] Remover pasta `prisma/` do frontend
- [ ] Remover dependências do `package.json`:
  - `@prisma/client`
  - `prisma`
  - `@prisma/adapter-vercel`
- [ ] Remover `DATABASE_URL` do `.env.development`
- [ ] Atualizar build scripts (remover `prisma generate`)

#### 3.5 - Deploy e Validação DEV

- [ ] Commit e push das mudanças na branch `development`
- [ ] Vercel redeploy automático
- [ ] Testar **TODAS** as funcionalidades no frontend DEV:
  - [ ] Listagem de produtos
  - [ ] Filtros e busca
  - [ ] Carrinho de compras
  - [ ] Formulário de pedido
  - [ ] Qualquer outra feature que use dados do banco
- [ ] Validar performance (latência aceitável DEV → Render)
- [ ] Confirmar CORS funcionando corretamente

---

### 🚀 FASE 4: Setup Backend PRD

**Objetivo:** Criar infraestrutura de produção robusta no Render

#### 4.1 - Provisionar PostgreSQL PRD

- [ ] Dashboard Render → New → PostgreSQL
- [ ] Nome: `ohana-api-prod-db`
- [ ] Region: Oregon (US West)
- [ ] Plano: **Starter** ($7/mês - 1GB, backups diários)
- [ ] Copiar `Internal Database URL`

#### 4.2 - Provisionar Web Service PRD

- [ ] Dashboard Render → New → Web Service
- [ ] Repository: `danieltquadros/ohana-api`
- [ ] Nome: `ohana-api-prod`
- [ ] Branch: `main` (mesmo branch, diferencia por env vars)
- [ ] Region: Oregon
- [ ] Build Command: `npm install && npx prisma generate && npm run build`
- [ ] Start Command: `npm run start:prod`
- [ ] Plano: **Starter** ($7/mês - 512MB RAM, sempre ativo)

#### 4.3 - Configurar Environment Variables PRD

```env
DATABASE_URL=[Internal Database URL do PostgreSQL PRD]
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://www.ohanasushidelivery.com.br
```

#### 4.4 - Executar Migration e Seed PRD

- [ ] Localmente, apontar para banco PRD (External URL)
- [ ] Executar: `npx prisma migrate deploy`
- [ ] Executar: `npx ts-node prisma/seed.ts` (popula com dados de produção)

#### 4.5 - Validar Backend PRD

- [ ] Acessar: `https://ohana-api-prod-[hash].onrender.com/api/products`
- [ ] Verificar retorno com produtos
- [ ] Testar GraphQL: `https://ohana-api-prod-[hash].onrender.com/graphql`
  - **Apollo Sandbox desabilitado** em PRD ✅ (NODE_ENV=production)

#### 4.6 - Custom Domain PRD (Opcional)

- [ ] Configurar DNS: `api.ohanasushidelivery.com.br` → Render
- [ ] No Render, add custom domain
- [ ] Certificado SSL automático
- [ ] Atualizar CORS_ORIGIN se necessário

---

### 🔄 FASE 5: Migração Database PRD

**Objetivo:** Frontend PRD consumir 100% do Backend PRD, remover Prisma do frontend PRD

#### 5.1 - Preparação

- [ ] Backend PRD rodando e validado (Fase 4 completa)
- [ ] Todos os endpoints necessários disponíveis
- [ ] Dados de produção populados no banco PRD

#### 5.2 - Atualizar Frontend PRD

**Branch:** `master`

- [ ] Fazer merge de `development` → `master` (traz refatorações da Fase 3)
- [ ] Atualizar `.env.production`:
  ```env
  NEXT_PUBLIC_API_URL=https://ohana-api-prod-[hash].onrender.com/api
  # OU se configurou custom domain:
  NEXT_PUBLIC_API_URL=https://api.ohanasushidelivery.com.br/api
  ```
- [ ] Remover `DATABASE_URL` completamente
- [ ] Confirmar que não há imports de `@prisma/client`

#### 5.3 - Deploy PRD

- [ ] Push branch `master` para GitHub
- [ ] Vercel deploy automático em www.ohanasushidelivery.com.br
- [ ] Monitorar logs durante deploy

#### 5.4 - Validação PRD e Go Live

- [ ] Testar **TODAS** as funcionalidades em produção:
  - [ ] Listagem de produtos
  - [ ] Filtros e busca
  - [ ] Carrinho de compras
  - [ ] Formulário de pedido
  - [ ] Integração com WhatsApp
  - [ ] Qualquer outra feature crítica
- [ ] Validar performance (latência aceitável)
- [ ] Monitorar erros no console do navegador
- [ ] Testar em diferentes dispositivos (mobile, desktop)

#### 5.5 - Plano de Rollback

**Se algo der errado:**

- [ ] Reverter deploy no Vercel (dashboard → rollback)
- [ ] OU atualizar `.env.production` para voltar ao banco antigo temporariamente
- [ ] Investigar e corrigir problema
- [ ] Tentar novamente

#### 5.6 - Desativação do Banco Antigo

- [ ] Aguardar 30 dias de estabilidade
- [ ] Exportar backup final do banco Vercel Postgres
- [ ] Desativar banco antigo do frontend
- [ ] Documentar migração completa

---

### 🔐 FASE 6: Features Essenciais

**Objetivo:** Backend com funcionalidades necessárias para produção

#### 6.1 - Autenticação/Autorização

- [ ] Implementar JWT authentication
- [ ] Roles: Admin, User
- [ ] Proteger endpoints administrativos

#### 6.2 - Upload de Imagens

- [ ] Integração com Cloudinary ou S3
- [ ] Endpoint para upload de imagens de produtos
- [ ] Validação de tipos de arquivo

#### 6.3 - Painel Administrativo (Backend)

- [ ] CRUD de produtos via API
- [ ] Gerenciamento de categorias
- [ ] Gerenciamento de ingredientes
- [ ] Dashboard de pedidos (futuro)

#### 6.4 - Monitoramento e Logs

- [ ] Configurar logs estruturados
- [ ] Alertas de erro (email ou Slack)
- [ ] Monitorar performance do banco

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

**Última atualização:** 14/02/2026  
**Versão:** 2.0.0  
**Próximo passo:** Fase 3 - Migração Database DEV (remover Prisma do frontend)
