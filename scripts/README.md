# 📁 Scripts e Testes - Ohana API

Pasta organizada com scripts SQL, testes PowerShell e Postman Collection para desenvolvimento e produção.

---

## 📂 Estrutura

```
scripts/
├── sql/                          # Scripts SQL para configuração de banco
│   ├── SETUP_PRD_DATABASE.sql   # ⭐ Setup completo do banco PRD
│   ├── INSERT_ADMINS_FORCE.sql  # Criar admins (DEV/PRD)
│   ├── FIX_SEQUENCE_PRODUCTS.sql# Corrigir auto-increment sequences
│   └── VERIFY_SEQUENCE_FIX.sql  # Verificar se sequences estão OK
│
├── tests/                        # Scripts de teste PowerShell
│   ├── TEST_DEV_AUTH_FIXED.ps1  # ✅ Testes completos DEV (5 testes)
│   └── TEST_PRD_AUTH.ps1        # ⭐ Testes completos PRD (6 testes)
│
├── Ohana_Sushi_API.postman_collection.json  # ⭐ Collection Postman completa
├── Ohana_DEV.postman_environment.json       # Environment DEV
├── Ohana_PRD.postman_environment.json       # Environment PRD
└── README.md                                # Este arquivo
```

---

## 🧪 Testes PowerShell

### `TEST_DEV_AUTH_FIXED.ps1`

Valida autenticação e proteção no ambiente de **desenvolvimento**.

**Execução:**

```powershell
cd c:\rep\dtq\ohana\ohana-api\scripts\tests
.\TEST_DEV_AUTH_FIXED.ps1
```

**Testes realizados:**

1. ✅ Login SUPER_ADMIN
2. ✅ Criar produto (com token admin)
3. ✅ Bloqueio sem token (401)
4. ✅ GET público (sem autenticação)
5. ✅ Login ADMIN

**Credenciais DEV:**

- SUPER_ADMIN: `admin@ohanasushi.com` / `Admin@2026!`
- ADMIN: `gerente@ohanasushi.com` / `Admin@2026!`

---

### `TEST_PRD_AUTH.ps1`

Valida autenticação e proteção no ambiente de **produção**.

**Execução:**

```powershell
cd c:\rep\dtq\ohana\ohana-api\scripts\tests
.\TEST_PRD_AUTH.ps1
```

**Testes realizados:**

1. ✅ Login SUPER_ADMIN
2. ✅ Criar produto teste
3. ✅ Bloqueio sem token (401)
4. ✅ GET público
5. ✅ Login ADMIN
6. 🗑️ Deletar produto teste (cleanup)

**Credenciais PRD:**

- SUPER_ADMIN: `admin@ohanasushidelivery.com.br` / `Admin@2026!`
- ADMIN: `gerente@ohanasushidelivery.com.br` / `Admin@2026!`

**⚠️ IMPORTANTE:** Trocar senhas após primeiro login em PRD!

---

## 🗄️ Scripts SQL

### `SETUP_PRD_DATABASE.sql` ⭐

**Script completo para configurar banco de produção.**

**Quando usar:**

- Após primeiro deploy do Render PRD
- Se migrations falharem no deploy automático

**O que faz:**

1. Cria ENUMs (UserRole, UserStatus, CategoryType) se não existirem
2. Verifica/corrige estado das migrations
3. Cria usuários administrativos (SUPER_ADMIN e ADMIN)
4. Corrige sequences de auto-increment
5. Validações finais

**Como usar:**

1. Acesse: [Neon Console](https://console.neon.tech)
2. Selecione: **ohana-prod-db** (ep-mute-fog-aee0x6xr)
3. Abra: SQL Editor
4. Copie e cole o conteúdo do arquivo
5. Execute **por partes** (leia os comentários do script)

---

### `INSERT_ADMINS_FORCE.sql`

Cria/recria usuários administrativos com hash bcrypt válido.

**Uso:**

- Resetar senhas de admin
- Criar admins em novo banco

**Credenciais criadas:**

- Email: ajustar conforme ambiente (DEV: @ohanasushi.com, PRD: @ohanasushidelivery.com.br)
- Senha: `Admin@2026!`
- Hash: `$2b$10$NsKO/nAcpzZwxJHSNiyOy.9gYVFEjVrmqPykC1W6sLBr0P4YrCZ26`

---

### `FIX_SEQUENCE_PRODUCTS.sql`

Corrige dessincronização de sequences (auto-increment).

**Quando usar:**

- Erro: `duplicate key violates unique constraint "products_pkey"`
- Após importação manual de dados SQL

**O que faz:**

```sql
SELECT setval('products_id_seq', MAX(id) + 1, false);
-- Repete para todas as tabelas com auto-increment
```

---

### `VERIFY_SEQUENCE_FIX.sql`

Verificação rápida se sequences estão corretas.

**Resultado esperado:**

```
table_name | max_id | proximo_id | status
products   | 25     | 26         | ✅ OK - Proximo INSERT vai funcionar
```

---

## 📮 Postman Collection

### Importar Collection e Environments

**1. Importar Collection:**

- Abra Postman
- File → Import
- Selecione: `Ohana_Sushi_API.postman_collection.json`

**2. Importar Environments:**

- File → Import
- Selecione: `Ohana_DEV.postman_environment.json`
- Repita para: `Ohana_PRD.postman_environment.json`

**3. Selecionar Environment:**

- Canto superior direito: Dropdown "No Environment"
- Escolha: **Ohana DEV** ou **Ohana PRD**

---

### Estrutura da Collection

**📁 Authentication**

- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login (auto-salva token) ⭐
- `POST /auth/guest` - Criar guest sem senha
- `POST /auth/convert-to-user` - Converter guest → user
- `GET /auth/profile` - Ver perfil autenticado

**📁 Products**

- `GET /products` - Listar (público)
- `GET /products/:id` - Buscar por ID (público)
- `POST /products` - Criar (admin) 🔒
- `PATCH /products/:id` - Atualizar (admin) 🔒
- `DELETE /products/:id` - Deletar (super_admin) 🔒

**📁 Product Types**

- CRUD completo (GET público, CUD protegido)

**📁 Categories**

- CRUD completo (GET público, CUD protegido)

**📁 Ingredients**

- CRUD completo (GET público, CUD protegido)

**📁 Combos**

- CRUD completo + `/combos/active` (GET público, CUD protegido)

---

### Como Usar

**Passo 1: Login**

1. Selecione environment (DEV ou PRD)
2. Abra: `Authentication → Login`
3. Clique: **Send**
4. ✅ Token salvo automaticamente em `{{accessToken}}`

**Passo 2: Testar Endpoints Protegidos**

1. Endpoints com 🔒 usam automaticamente `{{accessToken}}`
2. Teste: `Products → Create Product`
3. ✅ Se login foi feito, funciona automaticamente

**Passo 3: Endpoints Públicos**

1. Não precisam de login
2. Teste: `Products → List Products`
3. ✅ Funciona sem autenticação

---

## 🚀 Workflow de Deploy

### Ambiente DEV (já configurado ✅)

1. Branch: `development` → Auto-deploy Render
2. URL: https://ohana-api-dev-a7kk.onrender.com
3. Database: Neon DEV (ep-gentle-mouse-aee0x6xr-pooler)
4. ✅ Migrations aplicadas
5. ✅ Admins criados
6. ✅ Sequences corrigidas
7. ✅ 5/5 testes passando

---

### Ambiente PRD (próximo passo)

**1. Merge para main:**

```powershell
cd c:\rep\dtq\ohana\ohana-api
git checkout main
git pull origin main
git merge development --no-ff -m "merge: deploy authentication and RBAC to production"
git push origin main
```

**2. Aguardar deploy Render PRD:**

- URL: https://ohana-api-prd.onrender.com
- Tempo: ~3-5 minutos
- Monitorar: Render Dashboard → Logs

**3. Configurar banco PRD:**

```powershell
# Abrir SQL script
notepad scripts\sql\SETUP_PRD_DATABASE.sql

# Executar no Neon PRD (SQL Editor)
# Seguir instruções dentro do arquivo
```

**4. Validar PRD:**

```powershell
cd scripts\tests
.\TEST_PRD_AUTH.ps1
```

**5. Trocar senhas admin:**

- Usar Postman: `PATCH /auth/profile`
- Ou criar endpoint `PATCH /users/:id` no backend

---

## 📊 Resumo de Status

| Item                | DEV           | PRD         |
| ------------------- | ------------- | ----------- |
| Backend Deploy      | ✅ OK         | ⏳ Pendente |
| Database Migrations | ✅ Aplicadas  | ⏳ Pendente |
| Admins Criados      | ✅ 2 users    | ⏳ Pendente |
| Sequences OK        | ✅ Corrigidas | ⏳ Pendente |
| Tests 5/5           | ✅ Passing    | ⏳ Pendente |
| Postman Collection  | ✅ Criada     | ✅ Pronta   |

---

## 🔐 Credenciais

### DEV

- **SUPER_ADMIN:** admin@ohanasushi.com / Admin@2026!
- **ADMIN:** gerente@ohanasushi.com / Admin@2026!
- **Database:** ep-gentle-mouse-aee0x6xr-pooler.c-2.us-east-2.aws.neon.tech

### PRD

- **SUPER_ADMIN:** admin@ohanasushidelivery.com.br / Admin@2026!
- **ADMIN:** gerente@ohanasushidelivery.com.br / Admin@2026!
- **Database:** ep-mute-fog-aee0x6xr.c-2.us-east-2.aws.neon.tech

⚠️ **PRD:** Trocar senhas imediatamente após primeiro acesso!

---

## 📚 Documentação Adicional

- **Autenticação completa:** `README-AUTH.md` (raiz do projeto)
- **Plano de ação:** `ACTION_PLAN.md` (raiz do projeto)
- **Análise técnica:** `TECHNICAL_ANALYSIS.md` (raiz do projeto)

---

## 🆘 Troubleshooting

### Erro 401 ao criar produto

**Causa:** Token expirado ou inválido  
**Solução:** Fazer login novamente (Postman ou script PS)

### Erro 500 ao criar produto

**Causa:** Sequence dessincronizada  
**Solução:** Executar `FIX_SEQUENCE_PRODUCTS.sql`

### Migrations falhando no Render

**Causa:** ENUMs não existem  
**Solução:** Executar Passo 2 do `SETUP_PRD_DATABASE.sql` manualmente

### Postman não salva token

**Causa:** Script de teste falhou  
**Solução:** Verificar Tab "Tests" do request Login, deve ter:

```javascript
const response = pm.response.json();
pm.collectionVariables.set('accessToken', response.accessToken);
```

---

**Última atualização:** 23/02/2026  
**Versão:** 2.0 (DEV validado, PRD pronto para deploy)
