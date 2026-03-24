# 🚀 Guia de Deploy PRD - Ohana API

> **Status Atual:** DEV 100% validado ✅ | PRD deployado e validado ✅ (23/02/2026)

---

## ✅ Pré-requisitos (COMPLETO)

- ✅ RolesGuard e @Roles() decorator implementados
- ✅ Todos endpoints administrativos protegidos (POST/PATCH/DELETE)
- ✅ Testes locais: 9/9 passando
- ✅ Branch `feature/role-based-access-control` mergeada em `development`
- ✅ Render DEV: deployment bem-sucedido
- ✅ Neon DEV: migrations aplicadas, admins criados, sequences corrigidas
- ✅ Validação DEV: 5/5 testes passando
- ✅ Scripts organizados em `scripts/`
- ✅ Postman Collection criada

---

## 📋 Checklist de Deploy

### Passo 1: Merge development → main (5 min)

```powershell
# Navegar para o diretório do projeto
cd c:\rep\dtq\ohana\ohana-api

# Verificar se development está atualizado
git checkout development
git pull origin development

# Mudar para main e fazer merge
git checkout main
git pull origin main
git merge development --no-ff -m "merge: deploy authentication and RBAC to production"

# Push para main (isso vai triggar deploy automático no Render PRD)
git push origin main
```

**Confirmação esperada:**

```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
To github.com:user/ohana-api.git
   abc1234..def5678  main -> main
```

---

### Passo 2: Monitorar Deploy Render PRD (3-5 min)

1. **Acessar Dashboard:**
   - URL: https://dashboard.render.com
   - Login com sua conta

2. **Selecionar serviço:**
   - Clique em: **ohana-api-prd**

3. **Acompanhar logs em tempo real:**
   - Tab: **Logs**
   - Procurar por:
     ```
     ==> Running build command: npm install --include=dev && npx prisma migrate deploy...
     ==> Running 'npm run start:prod'
     [Nest] Nest application successfully started
     ```

4. **Possíveis cenários:**

   **✅ Sucesso (Ideal):**

   ```
   4 migrations found in prisma/migrations
   All migrations have been successfully applied
   Database is up to date!
   [Nest] Nest application successfully started
   ```

   → **Prosseguir para Passo 3**

   **⚠️ Migration Failed (Esperado):**

   ```
   Error: P3009 migrate found failed migrations in the target database
   or
   Error: type "UserRole" does not exist
   ```

   → **Não se preocupe!** Isso é esperado para banco vazio.  
   → **Prosseguir para Passo 3** (vamos corrigir manualmente)

   **❌ Build Error:**

   ```
   npm ERR! code ELIFECYCLE
   ```

   → Verificar logs completos, pode ser problema de memória ou dependência

---

### Passo 3: Configurar Banco Neon PRD (10 min)

1. **Abrir SQL Editor do Neon:**
   - URL: https://console.neon.tech
   - Projeto: **ohana-prod-db**
   - Branch: **main**
   - Database: **ohana_prod** (ep-mute-fog-aee0x6xr)

2. **Abrir script SQL:**

   ```powershell
   notepad scripts\sql\SETUP_PRD_DATABASE.sql
   ```

3. **Executar no SQL Editor (por partes):**

   **📌 NUNCA execute o arquivo inteiro de uma vez!**  
   Siga a ordem do script:

   **a) Verificar estado atual (opcional):**

   ```sql
   SELECT typname FROM pg_type WHERE typname IN ('UserRole', 'UserStatus', 'CategoryType');
   SELECT table_name FROM information_schema.tables WHERE table_name = 'users';
   ```

   **b) Criar ENUMs (se não existirem):**

   ```sql
   -- Copiar e executar PASSO 2 do script
   DO $$ BEGIN ... END $$;
   ```

   **c) Verificar migrations:**

   ```sql
   SELECT migration_name, finished_at, rolled_back_at
   FROM "_prisma_migrations"
   ORDER BY finished_at DESC;
   ```

   - Se houver FAILED, seguir instruções do script para corrigir

   **d) Criar admins:**

   ```sql
   -- Copiar e executar PASSO 4 do script
   DELETE FROM users WHERE email IN (...);
   INSERT INTO users (...) VALUES (...);
   ```

   **e) Verificar criação:**

   ```sql
   SELECT id, email, role, status FROM users ORDER BY id;
   ```

   **Resultado esperado:**

   ```
   id | email                              | role         | status
   1  | admin@ohanasushidelivery.com.br   | SUPER_ADMIN  | ACTIVE
   2  | gerente@ohanasushidelivery.com.br | ADMIN        | ACTIVE
   ```

   **f) Verificar sequences:**

   ```sql
   -- Copiar e executar PASSO 5.1 do script
   SELECT 'products' as tabela, MAX(id)...
   ```

   - Se aparecer ❌ PRECISA CORRIGIR, executar Passo 5.2
   - Se aparecer ✅ OK, pular para validação

4. **Restart Render PRD (se necessário):**
   - Se executou correções de migration/ENUMs
   - Render Dashboard → ohana-api-prd → Manual Deploy → **Restart service**
   - Aguardar ~30 segundos

---

### Passo 4: Validar PRD (5 min)

**Executar script de testes:**

```powershell
cd c:\rep\dtq\ohana\ohana-api\scripts\tests
.\TEST_PRD_AUTH.ps1
```

**Resultado esperado:**

```
============================================================
  TESTES DE VALIDACAO - PRODUCAO
============================================================

=== 1. TESTAR LOGIN SUPER_ADMIN ===
[OK] LOGIN OK!
ID: 1
Email: admin@ohanasushidelivery.com.br
Role: SUPER_ADMIN
Status: ACTIVE

=== 2. TESTAR PROTECAO - CRIAR PRODUTO ===
[OK] PRODUTO CRIADO!
ID: 26
Titulo: Temaki Teste PRD
Preco: R$ 29.90

=== 3. TESTAR BLOQUEIO - Sem Token ===
[OK] 401 Unauthorized - Protecao funcionando!

=== 4. TESTAR GET PUBLICO ===
[OK] GET publico funcionando!
Total de produtos: 26

=== 5. TESTAR LOGIN ADMIN ===
[OK] LOGIN GERENTE OK!
Role: ADMIN

=== 6. LIMPAR PRODUTO DE TESTE ===
[OK] Produto de teste deletado (ID: 26)

============================================================
  TESTES FINALIZADOS!
============================================================
```

**✅ Se todos os 6 testes passaram: PRD VALIDADO!**

**❌ Se algum teste falhou:**

- Teste 1 falhou (401): Verificar se admins foram criados no banco
- Teste 2 falhou (500): Verificar logs do Render, provavelmente sequence ou migration
- Teste 3 ou 4 falhou: Problema de configuração de rotas/guards

---

### Passo 5: Validar com Postman (opcional, 3 min)

1. **Abrir Postman**
2. **Importar arquivos (se ainda não importou):**
   - File → Import
   - Selecionar: `scripts/Ohana_Sushi_API.postman_collection.json`
   - Importar também: `scripts/Ohana_PRD.postman_environment.json`

3. **Selecionar environment:**
   - Canto superior direito: **Ohana PRD**

4. **Fazer login:**
   - `Authentication → Login`
   - Click: **Send**
   - ✅ Token salvo automaticamente

5. **Testar endpoints:**
   - `Products → List Products` (público, sem auth)
   - `Products → Create Product` (protegido, usa token auto)
   - ✅ Ambos devem funcionar

---

### Passo 6: Trocar Senhas de Produção (IMPORTANTE!)

**🔐 NUNCA deixe senhas padrão em produção!**

**Opção A: Via Postman (Recomendado)**

1. Fazer login como SUPER_ADMIN
2. `Authentication → Get Profile` (verificar dados)
3. Criar request `PATCH {{baseUrl}}/auth/profile`:
   ```json
   {
     "password": "NovaSenhaForte@2026!"
   }
   ```

**Opção B: Via SQL (Temporário)**

```sql
-- Gerar novo hash com Node.js:
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('NovaSenhaForte@2026!', 10));"

-- Atualizar no banco:
UPDATE users
SET password = '$2b$10$NovoHashGerado...'
WHERE email = 'admin@ohanasushidelivery.com.br';
```

**⚠️ Recomendação:** Criar endpoint `PATCH /api/users/:id/password` no backend (futuro)

---

## 🎯 Validação Final PRD

Checklist completo (✅ Concluído em 23/02/2026):

- [x] Git: development mergeado com main ✅
- [x] Render PRD: Deploy concluído sem erros ✅
- [x] Neon PRD: migrations aplicadas ✅
- [x] Neon PRD: ENUMs criados (UserRole, UserStatus, CategoryType) ✅
- [x] Neon PRD: Admins criados (SUPER_ADMIN e ADMIN) ✅
- [x] Neon PRD: Sequences corrigidas ✅
- [x] Testes PowerShell: 6/6 passando ✅
- [x] Postman: Login funcionando ✅
- [x] Postman: Create product funcionando ✅
- [ ] Senhas de admin trocadas (⚠️ Pendente - verificar!)
- [x] Frontend PRD: Endpoints públicos funcionando ✅

---

## 🌐 URLs Produção

### Backend PRD

- **API:** https://ohana-api-prd.onrender.com/api
- **GraphQL:** https://ohana-api-prd.onrender.com/graphql
- **Render Dashboard:** https://dashboard.render.com

### Frontend PRD

- **Website:** https://www.ohanasushidelivery.com.br
- **Vercel Dashboard:** https://vercel.com/dashboard

### Database PRD

- **Neon Console:** https://console.neon.tech
- **Database:** ep-mute-fog-aee0x6xr.c-2.us-east-2.aws.neon.tech
- **Project:** ohana-prod-db

---

## 🔄 Próximos Passos (Pós-Deploy)

### 1. Atualizar Frontend PRD (5 min)

- Configurar `NEXT_PUBLIC_API_URL=https://ohana-api-prd.onrender.com/api`
- Testar endpoints públicos (GET /products)
- Validar fluxo de carrinho/checkout

### 2. Documentar Credenciais (3 min)

- Salvar senhas NOVAS em cofre seguro (1Password, Bitwarden, etc.)
- **NUNCA** commitar senhas no Git
- Compartilhar apenas com equipe autorizada

### 3. Configurar Monitoramento (futuro)

- Render: Configurar alertas de downtime
- Neon: Configurar alertas de uso de CPU/memória
- Sentry: Integração para error tracking (Fase 5.1 do ACTION_PLAN)

### 4. Iniciar Angular Admin Panel (Fase 2)

- Estimativa: 3-4 semanas
- Tecnologias: Angular 18 + Angular Material + RxJS
- Funcionalidades: CRUD completo de produtos, categorias, combos
- Deploy: admin.ohanasushidelivery.com.br (Vercel)

---

## 📞 Suporte

**Problemas durante deploy?**

1. **Verificar logs do Render:**

   ```
   Dashboard → ohana-api-prd → Logs
   ```

2. **Verificar status do Neon:**

   ```
   Console → ohana-prod-db → Monitoring
   ```

3. **Re-executar testes:**

   ```powershell
   .\scripts\tests\TEST_PRD_AUTH.ps1
   ```

4. **Rollback (se necessário):**
   ```powershell
   git checkout main
   git reset --hard HEAD~1  # Voltar 1 commit
   git push origin main --force  # Forçar push (cuidado!)
   ```

**Erros comuns:**

- **P2002 (duplicate key):** Sequences dessincronizadas → executar FIX_SEQUENCE_PRODUCTS.sql
- **P2003 (foreign key):** productTypeId inválido → verificar IDs existentes
- **P3009 (migration failed):** ENUMs não criadas → executar PASSO 2 do SETUP_PRD_DATABASE.sql
- **401 Unauthorized:** Token expirado → fazer login novamente

---

**Última atualização:** 09/03/2026
**Responsável:** Developer (Daniel Quadros)
**Status:** DEV validado ✅ | PRD deployado e validado ✅
