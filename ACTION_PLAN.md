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
┌────────────────────────────────────────────────────────────────┐
│                       DESENVOLVIMENTO                          │
├────────────────────────────────────────────────────────────────┤
│ Frontend DEV                                                   │
│ ├─ URL: ohana-sushi-delivery-git-development...vercel.app     │
│ ├─ Branch: development                                         │
│ ├─ Deploy: Vercel Preview                                      │
│ └─ Consome: Backend DEV                                        │
│                                                                │
│ Backend DEV                                                    │
│ ├─ URL: https://ohana-api-dev-a7kk.onrender.com               │
│ ├─ Branch: main (deploy automático)                           │
│ ├─ Deploy: Render Web Service (Free Tier)                     │
│ └─ Database: Neon PostgreSQL DEV (Free - 3GB)                 │
│                                                                │
│ Sincronização:                                                 │
│ └─ Frontend DEV → Backend DEV → Neon DEV                      │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                          PRODUÇÃO                              │
├────────────────────────────────────────────────────────────────┤
│ Frontend PRD                                                   │
│ ├─ URL: www.ohanasushidelivery.com.br                         │
│ ├─ Branch: master/main                                         │
│ ├─ Deploy: Vercel Production                                   │
│ └─ Consome: Backend PRD                                        │
│                                                                │
│ Backend PRD                                                    │
│ ├─ URL: https://ohana-api-prd.onrender.com ✅                 │
│ │   (ou api.ohanasushidelivery.com.br via DNS - futuro)       │
│ ├─ Branch: main                                                │
│ ├─ Deploy: Render Web Service (Free Tier)                     │
│ └─ Database: Neon PostgreSQL PRD (Free - 3GB)                 │
│                                                                │
│ Sincronização:                                                 │
│ └─ Frontend PRD → Backend PRD → Neon PRD                      │
└────────────────────────────────────────────────────────────────┘

**🔄 Decisão de Arquitetura:**
- **Backends:** Render (oferece múltiplos web services gratuitos)
- **Databases:** Neon (oferece 10 projetos PostgreSQL gratuitos)
- **Motivo:** Render só fornece 1 database gratuito, insuficiente para DEV+PRD
- **Tentativa anterior:** Fly.io (abandonado - requer cartão de crédito após 5min)
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

### ✅ FASE 3: Migração Database DEV (CONCLUÍDA)

**Objetivo:** Frontend DEV consumir 100% do Backend DEV, remover Prisma do frontend DEV

#### 3.1 - Análise do Frontend Atual

- [x] Identificar todas as queries Prisma no frontend
- [x] Listar todas as operações de banco: products (principal)
- [x] Mapear quais endpoints do backend já existem
- [x] Confirmar que todos endpoints necessários estão disponíveis

#### 3.2 - Garantir Endpoints no Backend DEV

- [x] Validar endpoints REST:
  - `/api/products` ✅ (existe e funcionando)
  - `/api/categories` ✅ (existe)
  - `/api/ingredients` ✅ (existe)
  - `/api/combos` ✅ (existe)
  - `/api/product-types` ✅ (existe)
- [x] Configurar CORS para permitir frontend DEV e localhost

#### 3.3 - Refatorar Frontend DEV

**Branch:** `development`

- [x] Substituir fetch de `/api/products` (local) por backend DEV
- [x] Atualizar `hooks/useProducts.ts` para usar `NEXT_PUBLIC_API_URL`
- [x] Ajustar mapeamento de dados (price string→number, ingredients aninhados)
- [x] Testar localmente (localhost:3000 consumindo backend DEV no Render)

#### 3.4 - Remover Prisma do Frontend DEV

- [x] Remover pasta `pages/api/` (API routes locais)
- [x] Remover pasta `lib/` (prisma.ts)
- [x] Remover pasta `prisma/` (schema.prisma, seed.ts)
- [x] Remover dados estáticos não usados (comboList.ts, portionList.ts, etc.)
- [x] Remover dependências do `package.json`:
  - `@prisma/client` ✅
  - `prisma` ✅
  - `ts-node` ✅
- [x] Remover `DATABASE_URL` do `.env.development`
- [x] Atualizar build scripts (remover `prisma generate`, `postinstall`, `db:*`)

#### 3.5 - Deploy e Validação DEV

- [x] Configurar variável `NEXT_PUBLIC_API_URL` no Vercel (ambiente Preview)
- [x] Commit: `a9f7838` - Remoção completa do Prisma
- [x] Push para branch `development`
- [x] Vercel redeploy automático em andamento

**Commits da Fase 3:**

- `51dafe1` - Conectar frontend DEV ao backend DEV
- `a9f7838` - Remover Prisma e dados locais do frontend DEV
- Backend: `576ac86` - Adicionar configuração CORS

**Próximo:** Teste completo de todas as funcionalidades no frontend DEV após deploy

---

### ✅ FASE 4: Migração para Neon + Setup Backend PRD (CONCLUÍDA)

**Objetivo:** Migrar databases para Neon (resolve limitação de 1 banco gratuito no Render) e criar ambiente PRD

**Status:** ✅ Concluída em 17/02/2026

**Histórico de decisão:**

- ✅ Render funcionando para backend DEV
- ❌ Render só oferece 1 database PostgreSQL gratuito
- ❌ Fly.io tentado mas requer cartão de crédito (trial 5min)
- ✅ **Solução:** Neon oferece 10 databases PostgreSQL gratuitos sem cartão

---

#### 4.1 - Criar Conta e Databases no Neon

**4.1.1 - Criar Conta Neon:**

- [ ] Acessar: https://neon.tech
- [ ] Sign up com GitHub (danieltquadros)
- [ ] Verificar email

**4.1.2 - Criar Database DEV:**

- [ ] Dashboard → New Project
- [ ] Nome: `ohana-dev-db`
- [ ] Region: **AWS us-east-2** (Ohio) ou **us-east-1** (mais próximo do Brasil)
- [ ] PostgreSQL Version: 17 (latest)
- [ ] Plan: **Free Tier** (3GB storage, sempre ativo)
- [ ] Copiar Connection String:
  ```
  postgresql://[user]:[password]@[endpoint-id].us-east-2.aws.neon.tech/[db-name]?sslmode=require
  ```
- [ ] Salvar credenciais em local seguro

**4.1.3 - Criar Database PRD:**

- [ ] Dashboard → New Project
- [ ] Nome: `ohana-prod-db`
- [ ] Region: **AWS us-east-2** (Ohio) ou **us-east-1**
- [ ] PostgreSQL Version: 17
- [ ] Plan: **Free Tier**
- [ ] Copiar Connection String
- [ ] Salvar credenciais

---

#### 4.2 - Migrar Backend DEV para Neon

**4.2.1 - Preparação Local:**

- [ ] Criar arquivo `.env.neon-dev` localmente:
  ```env
  DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/[db]?sslmode=require
  ```
- [ ] **Não commitar** este arquivo (já está no .gitignore)

**4.2.2 - Executar Migrations no Neon DEV:**

```bash
# Carregar env vars do Neon DEV
$env:DATABASE_URL="postgresql://[connection-string-neon-dev]"

# Aplicar migrations
npx prisma migrate deploy

# Executar seed
npx tsx prisma/seed.ts
```

**4.2.3 - Atualizar Render Backend DEV:**

- [ ] Dashboard Render → `ohana-api-dev` → Environment
- [ ] Atualizar variável `DATABASE_URL`:
  - **Antigo:** Render PostgreSQL Internal URL
  - **Novo:** Neon DEV Connection String
- [ ] Salvar e aguardar redeploy automático
- [ ] **MANTER banco Render como backup** (não deletar ainda)

**4.2.4 - Validar Backend DEV com Neon:**

- [ ] Acessar: `https://ohana-api-dev-a7kk.onrender.com/api/products`
- [ ] Verificar se retorna os 25 produtos esperados
- [ ] Testar no frontend DEV: https://ohana-sushi-delivery-git-development...vercel.app
- [ ] Verificar logs no Render (sem erros de conexão)
- [ ] Se OK: Marcar banco Render DEV para remoção futura ✅

---

#### 4.3 - Criar Backend PRD no Render

**4.3.1 - Provisionar Web Service PRD:**

- [ ] Dashboard Render → New → Web Service
- [ ] Repository: `danieltquadros/ohana-api`
- [ ] Nome: `ohana-api-prod`
- [ ] Branch: `main`
- [ ] Region: **Oregon (US West)** (manter consistência)
- [ ] Build Command: `npm install && npx prisma generate && npm run build`
- [ ] Start Command: `npm run start:prod`
- [ ] Plano: **Free Tier** (512MB RAM, cold start após 15min idle)

**4.3.2 - Configurar Environment Variables PRD:**

- [ ] No dashboard do Web Service PRD, adicionar:
  ```env
  DATABASE_URL=[Neon PRD Connection String]
  NODE_ENV=production
  PORT=3000
  CORS_ORIGIN=https://www.ohanasushidelivery.com.br,https://ohana-sushi-delivery-danieltquadros-projects.vercel.app
  ```

**4.3.3 - Executar Migrations no Neon PRD:**

```bash
# Carregar env vars do Neon PRD
$env:DATABASE_URL="postgresql://[connection-string-neon-prod]"

# Aplicar migrations
npx prisma migrate deploy

# Executar seed com dados de PRODUÇÃO
npx tsx prisma/seed.ts
```

**4.3.4 - Validar Backend PRD:**

- [ ] Aguardar deploy inicial do Render
- [ ] Copiar URL gerada: `https://ohana-api-prod-[hash].onrender.com`
- [ ] Acessar: `https://ohana-api-prod-[hash].onrender.com/api/products`
- [ ] Verificar JSON com 25 produtos
- [ ] Testar endpoint de health: `/api/ping` ou similar
- [ ] **Apollo Sandbox deve estar desabilitado** (NODE_ENV=production) ✅

**4.3.5 - Custom Domain PRD (Opcional - Futuro):**

- [ ] Registrar domínio: `api.ohanasushidelivery.com.br`
- [ ] Configurar DNS CNAME apontando para Render
- [ ] No Render, adicionar custom domain
- [ ] Certificado SSL automático (Let's Encrypt)
- [ ] Atualizar CORS_ORIGIN após ativação

---

#### 4.4 - Validação Final da Fase 4

**Checklist de Sucesso:**

- [x] ✅ Backend DEV rodando com Neon DEV
- [x] ✅ Backend PRD criado e rodando com Neon PRD
- [x] ✅ Ambos backends retornam dados corretos
- [x] ✅ Frontend DEV consumindo backend DEV normalmente
- [x] ✅ Migrations aplicadas em ambos databases Neon
- [x] ✅ Seeds executados com sucesso
- [x] ✅ Sem erros de conexão nos logs
- [x] ✅ Cold start aceitável (< 60s no free tier)

**Documentação:**

- [x] ✅ ACTION_PLAN atualizado com URLs finais
- [x] ✅ Connection strings do Neon registradas
- [x] ✅ Observações sobre cold start documentadas

**URLs Finais:**

- Backend DEV: `https://ohana-api-dev-a7kk.onrender.com`
- Backend PRD: `https://ohana-api-prd.onrender.com`
- Frontend PRD: `https://www.ohanasushidelivery.com.br`

---

### ✅ FASE 5: Migração Frontend PRD (CONCLUÍDA)

**Objetivo:** Frontend PRD consumir 100% do Backend PRD, remover Prisma do frontend PRD

**Status:** ✅ Concluída em 17/02/2026

#### 5.1 - Preparação ✅

- [x] Backend PRD rodando e validado (Fase 4 completa)
- [x] Todos os endpoints necessários disponíveis
- [x] Dados de produção populados no banco PRD

#### 5.2 - Atualizar Frontend PRD ✅

**Branch:** `master`

- [x] Merge de `development` → `master` (refatorações da Fase 3)
- [x] Criado `.env.production`:
  ```env
  NEXT_PUBLIC_API_URL=https://ohana-api-prd.onrender.com/api
  NEXT_PUBLIC_API_URL_PRD=https://ohana-api-prd.onrender.com/api
  ```
- [x] Removido `DATABASE_URL` completamente
- [x] Prisma removido do frontend PRD
- [x] Removidos dados locais (productList, comboList, etc.)

#### 5.3 - Deploy PRD ✅

- [x] Push branch `master` para GitHub
- [x] Vercel deploy em www.ohanasushidelivery.com.br
- [x] Deploy monitorado e concluído

**Desafios enfrentados:**

- ❌ Vercel não detectava pushes (branch configurada como `main`, código em `master`)
- ✅ Corrigido com commit vazio para trigger manual
- ❌ Vercel Cron bloqueado no free tier (só permite 1x/dia)
- ✅ Substituído por GitHub Actions (schedule personalizado)

#### 5.4 - Validação PRD e Go Live ✅

- [x] Testado funcionalidades em produção:
  - [x] Listagem de produtos ✅ (25 produtos do Backend PRD)
  - [x] Frontend renderizando corretamente
  - [x] Requisições para `ohana-api-prd.onrender.com/api/products`
  - [x] Apollo Sandbox desabilitado (NODE_ENV=production)
- [x] Performance validada (latência aceitável)
- [x] Console do navegador sem erros

#### 5.5 - Keep-Alive Configurado ✅

**Solução:** GitHub Actions (scheduler personalizado)

- [x] Criado workflow `.github/workflows/keep-alive-prd.yml`
- [x] Schedule: 00:00-01:00 + 10:00-23:55 (janela de silêncio 01h-10h)
- [x] Frequência: A cada 4 minutos (margem de segurança de 1min para Neon)
- [x] Testado manualmente com sucesso

**Explicação do intervalo de 4 minutos:**
- Neon suspende após 5 minutos de inatividade
- Pingando a cada 4 minutos = margem de 1 minuto de segurança
- Previne race condition (delays de rede/processing)
- Garante ZERO cold start durante horários ativos

#### 5.6 - Desativação do Banco Antigo (Pendente)

- [ ] Aguardar 30 dias de estabilidade
- [ ] Exportar backup final do banco Vercel Postgres (se ainda existir)
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

## � Estratégia Anti-Cold Start (Keep-Alive)

### Problema Identificado

**Free Tiers têm cold start:**

- **Render (Backend)**: Suspende após 15min de inatividade → 30-60s para acordar 🐢
- **Neon (Database)**: Suspende após 5min de inatividade → 2-5s para acordar ⚡
- **Total**: ~35-65s de delay na primeira requisição após período de inatividade

### Solução Implementada

**GitHub Actions + Keep-Alive Inteligente**

**Nota:** Inicialmente tentamos Vercel Cron, mas foi bloqueado no free tier (só permite 1x/dia). GitHub Actions é gratuito e permite schedule customizado!

**Arquivos criados:**

1. `ohana_sushi/.github/workflows/keep-alive-prd.yml` - GitHub Actions workflow
2. `ohana_sushi/app/api/cron/keep-alive-prd/route.ts` - API Route (não usado, mantido para referência)
3. `ohana-api/src/app.controller.ts` - Endpoint `/api/ping` para health check

**Estratégia por ambiente:**

```
DEV (Backend DEV + Database DEV):
├─ SEM keep-alive (cold start aceitável em desenvolvimento)
├─ Consumo Render: ~50h/mês (uso esporádico)
├─ Consumo Neon: ~50h/mês (de 191.9h disponíveis)
└─ Cold start: ~35-65s após inatividade ✅ OK para DEV

PRD (Backend PRD + Database PRD):
├─ COM keep-alive via GitHub Actions ✅
├─ Schedule: */4 0 + */4 10-23 (a cada 4min, exceto 1h-10h)
├─ Horários ativos: 00h-01h + 10h-00h = 15h/dia
├─ Horário de silêncio: 01h-10h (sem clientes)
├─ Frequência: ~225 pings/dia (margem segurança Neon)
├─ Consumo Render: 450h/mês (de 750h disponíveis) ✅
├─ Consumo Neon: ~150h/mês (de 191.9h disponíveis) ✅
└─ Cold start: 0s durante horários de funcionamento ⚡
```

### Recursos Economizados

**Com janela de silêncio 01h-10h:**

- **24h ativas**: 720h/mês Render → estoura limite de 750h ❌
- **15h ativas**: 450h/mês Render → **270h de economia** ✅
- **Total da conta**: DEV (50h) + PRD (450h) = **500h/mês** (~33% abaixo do limite)

### Configuração

**Environment Variable configurada (frontend PRD):**

```env
# .env.production
NEXT_PUBLIC_API_URL=https://ohana-api-prd.onrender.com/api
NEXT_PUBLIC_API_URL_PRD=https://ohana-api-prd.onrender.com/api
```

**GitHub Actions:**

- Workflow em `.github/workflows/keep-alive-prd.yml`
- Ativa automaticamente após push para `master`
- Logs visíveis em: GitHub → Actions → Keep-Alive Backend PRD
- Pode executar manualmente via "Run workflow"

### Alinhamento com Negócio

**Horários de funcionamento do delivery:**

- Almoço: 11h30-14h30 ✅ (sistema já ativo desde 10h)
- Jantar: 18h00-23h00 ✅ (100% coberto)
- Madrugada: 23h-01h ✅ (pedidos tardios cobertos)
- **Off**: 01h-10h 🌙 (sem clientes, pode dormir)

**Trade-off:**

- Primeiro acesso após 10h: cold start de ~60s ⚠️
- Impacto: mínimo (1-2x por dia, horário sem movimento)
- Benefício: 270h/mês economizadas + dentro dos limites ✅

### Monitoramento

**Verificar funcionamento:**

```bash
# Testar endpoint manualmente
curl https://ohana-api-prod.onrender.com/api/ping

# Resposta esperada:
{
  "status": "ok",
  "message": "Ohana API is running",
  "timestamp": "2026-02-16T...",
  "uptime": 12345.67,
  "environment": "production"
}
```

**Logs do GitHub Actions:**

- GitHub → Actions → Keep-Alive Backend PRD
- Cada execução registra: timestamp, status, response, horários
- Workflow falha se backend retornar != 200

**Alertas:**

- Se workflow falhar 3x seguidas → Investigar
- Se uptime do backend < 5min → Keep-alive não está funcionando
- GitHub envia email de notificação em caso de falha

### Desativação (quando necessário)

**Quando tráfego real mantiver o backend ativo:**

1. Desabilitar workflow: deletar `.github/workflows/keep-alive-prd.yml`
2. OU desabilitar no GitHub: Settings → Actions → Disable workflow
3. Commit e push (se deletou arquivo)

**Indicadores para desativar:**

- Tráfego > 100 acessos/dia
- Backend nunca suspende (uptime > 24h consistente)
- Custos justificam migração para plano pago

---

## �🛠️ Comando Rápidos

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
- [Neon Docs](https://neon.tech/docs/introduction)
- [Vercel Docs](https://vercel.com/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)

### Plataformas

- **Render Dashboard:** https://dashboard.render.com
- **Neon Console:** https://console.neon.tech
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repo Backend:** https://github.com/danieltquadros/ohana-api
- **GitHub Repo Frontend:** https://github.com/danieltquadros/ohana_sushi

### Neon PostgreSQL (Database Provider)

**Por que Neon?**

- ✅ 10 projetos PostgreSQL gratuitos (vs. 1 no Render)
- ✅ Serverless: sem cold start de database
- ✅ 3GB storage por projeto (free tier)
- ✅ Branching de databases (útil para testes)
- ✅ Connection pooling automático
- ✅ Backups point-in-time incluídos
- ✅ 100% compatível com PostgreSQL padrão
- ✅ Sem necessidade de cartão de crédito

**Free Tier Limites:**

- 10 projetos (databases)
- 3GB storage por projeto
- Compute: 191.9 horas/mês (suficiente para sempre ativo)
- Shared CPU
- Tudo $0/mês permanentemente

---

**Última atualização:** 16/02/2026  
**Versão:** 3.0.0  
**Próximo passo:** Fase 4 - Migração para Neon + Setup Backend PRD
