# Diretrizes de Desenvolvimento - Ohana API

## ⚠️ CHECKLIST OBRIGATÓRIO ANTES DE SUGERIR CÓDIGO

### Segurança

- [ ] Esta alteração introduz riscos de segurança?
- [ ] Precisa de configuração diferente para DEV vs PRD?
- [ ] Senhas/chaves estão em variáveis de ambiente?
- [ ] Estou usando configurações seguras (SSL, autenticação, etc.)?

### Qualidade de Código

- [ ] Estou desabilitando ESLint? (🚫 Repensar a solução)
- [ ] Estou usando tipos corretos ou `any`?
- [ ] **Estou usando `as any` para fazer compilar?** (🚫 NUNCA - encontre a solução correta)
- [ ] O código segue os padrões do projeto?
- [ ] Existe débito técnico sendo criado?

### Visão Sistêmica

- [ ] Como isso impacta outras partes do sistema?
- [ ] Se esta solução falhar, o que precisa ser revertido?
- [ ] Existe uma solução mais robusta e definitiva?
- [ ] Estou tratando só o sintoma ou a causa raiz?
- [ ] **Estou propondo a solução IDEAL ou apenas a mais simples?**

### Excelência Profissional (Projeto de Portfólio)

- [ ] Esta implementação impressionaria recrutadores e empresas?
- [ ] Escolhi a abordagem mais profissional, mesmo que mais demorada?
- [ ] Se houver uma solução técnica superior, avisei proativamente?
- [ ] O código demonstra conhecimento avançado e boas práticas?

### Comunicação

- [ ] Expliquei os trade-offs ANTES de sugerir código?
- [ ] Marquei código temporário explicitamente como temporário?
- [ ] Dei contexto suficiente para o aprendizado?
- [ ] Avisei sobre riscos e quando/como reverter?
- [ ] **Dei oportunidade para o usuário DIGITAR ao invés de apenas implementar?**

## 🎯 Princípios Fundamentais

### 1. Ensinar, não apenas fazer

- Explicar o **porquê** antes do **como**
- Contextualizar decisões arquiteturais
- Mostrar alternativas e seus trade-offs
- Incentivar perguntas e pensamento crítico
- **SEMPRE dar oportunidade para o usuário digitar o código**
  - Para aprendizado efetivo: usuário deve escrever, não apenas ler
  - Fornecer explicações detalhadas e deixar o usuário implementar
  - Se implementar algo, SEMPRE explicar depois linha por linha
  - Lembrar: o objetivo é aprendizado genuíno, não apenas código pronto

### 2. Segurança em primeiro lugar

- **SEMPRE** avisar sobre riscos de segurança ANTES de propor código
- Diferenciar claramente soluções para DEV vs PRD
- Nunca sugerir atalhos inseguros sem explicar as consequências
- Se uma solução temporária for insegura, marcar explicitamente

### 3. Qualidade sobre velocidade

- Não acumular débito técnico sem justificativa
- Preferir soluções corretas a quick fixes
- Se usar solução temporária, criar plano de refatoração
- Nunca deixar code smells sem endereçar

### 4. Pensar em produção desde o início

- Toda solução deve considerar ambiente de produção
- Configurações devem ser environment-aware
- Código deve ser production-ready por padrão
- Testes e validações devem cobrir cenários reais

### 5. Reverter quando falhar

- Se uma solução não funcionar, **SEMPRE** pedir para reverter
- Não acumular tentativas falhas no código
- Limpar código experimental antes de tentar nova abordagem
- Manter o repositório sempre em estado funcional

### 6. Excelência técnica em primeiro lugar (Portfólio Profissional)

- **SEMPRE escolher a solução mais profissional**, não a mais rápida
- Se existe uma abordagem tecnicamente superior, **propô-la proativamente**
- Este é um projeto de portfólio: código deve impressionar recrutadores
- Preferir complexidade bem implementada a simplicidade medíocre
- Quando houver trade-off simplicidade vs. robustez: **escolher robustez**
- **Consultoria ativa**: Sugerir melhorias arquiteturais mesmo não solicitadas
- Explicar por que a solução proposta é considerada "best practice" na indústria

### 7. Priorizar dinamicidade e inteligência do sistema

- **Dados dinâmicos > Hardcoded**: Sempre preferir configuração em banco
- **Sistema inteligente**: Minimizar lógica manual, maximizar automação
- **Flexibilidade**: Estruturas devem suportar mudanças sem código
- **Normalização**: Evitar duplicação de dados (3ª forma normal)
- **Escalabilidade**: Pensar em crescimento desde o início
- Exemplo: Ingredientes não devem duplicar por produto - usar tabela de junção

## 📝 Convenções do Projeto

### ESLint e TypeScript

- Não desabilitar regras do ESLint sem justificativa forte
- Configurar o ESLint corretamente em vez de suprimir warnings
- Usar tipos adequados do TypeScript/Prisma
- Manter `strict mode` sempre que possível

### Estrutura NestJS

- Seguir padrões de injeção de dependência
- Módulos devem ter responsabilidade única
- DTOs para validação de entrada
- Entities para representação de dados
- Services para lógica de negócio
- Controllers para endpoints HTTP

### Prisma

- Usar tipos gerados pelo Prisma Client
- Incluir relações quando necessário
- Tratar erros específicos do Prisma
- Manter schema.prisma como fonte única de verdade

### Testes (Jest)

**Estratégia:** Desenvolvimento paralelo - código e testes juntos

**O que testar:**

- ✅ **Unit Tests**: Toda lógica de negócio nos Services
- ✅ **E2E Tests**: Endpoints críticos da API
- ⚠️ **Controllers**: Apenas se houver lógica complexa (geralmente não)
- ❌ **DTOs**: Validação já testada pelo class-validator

**Fluxo de trabalho:**

1. Implementar feature no Service
2. Escrever testes unitários do Service (com mocks)
3. Escrever testes E2E dos endpoints principais
4. Garantir tudo verde antes de commit

**Mocking:**

- Mock do PrismaService em testes unitários
- **E2E Fase 1 (atual):** Mock do PrismaService para focar em HTTP/API
- **E2E Fase 2 (futuro):** Banco PostgreSQL separado para realismo 100%
- Usar `jest.fn()` para espionar chamadas

**Cobertura esperada:**

- Mínimo: 80% dos Services
- E2E: Fluxos principais (CRUD completo de cada recurso)

**Evolução dos Testes E2E:**

1. ✅ **Fase Atual:** E2E com mocks (aprendizado de Supertest, foco em API)
2. ⏭️ **Próxima Fase:** Migrar para banco PostgreSQL separado (realismo total)
3. 🎯 **Objetivo:** Testes que garantem comportamento real em ambiente similar a produção

## 🌍 Estratégia de Ambientes

### Estratégia de Branches

#### Branch Principal: `main`

- Código **production-ready**
- Sempre deve buildar sem erros
- Merges somente após code review e testes passando
- Protegida: não fazer commits diretos

#### Branches de Feature

- Padrão: `feature/nome-da-feature`
- Exemplos:
  - `feature/categories-crud`
  - `feature/user-authentication`
  - `feature/image-upload`

#### Branches de Hotfix

- Padrão: `hotfix/descrição-do-problema`
- Para correções urgentes em produção
- Merge direto para `main` após validação

#### Workflow Sugerido

```bash
# Criar nova feature
git checkout main
git pull origin main
git checkout -b feature/minha-feature

# Desenvolver e commitar
git add .
git commit -m "feat: descrição da feature"

# Atualizar com main antes de PR
git checkout main
git pull origin main
git checkout feature/minha-feature
git rebase main  # ou merge main

# Push e criar Pull Request
git push origin feature/minha-feature
```

### Configuração por Ambiente

#### Variáveis de Ambiente (.env)

**DEV (.env.development):**

```env
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/ohana_dev
PORT=3000
CORS_ORIGIN=http://localhost:3001
```

**PRD (.env.production):**

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@servidor-prod:5432/ohana_prod
PORT=3000
CORS_ORIGIN=https://ohanasushi.com.br
```

> **📋 Para roadmap detalhado, status de fases e plano de ação:** Ver [ACTION_PLAN.md](./ACTION_PLAN.md)

## 🔄 Processo de Evolução

Este documento é **vivo** e deve ser atualizado conforme:

- Descobrimos novos padrões ou problemas
- Implementamos novas features que exigem convenções
- Aprendemos lições de erros cometidos
- O projeto cresce e precisa de mais estrutura

**Toda vez que identificarmos uma situação que deveria estar documentada aqui, adicionamos.**

---

**Última atualização:** 10/02/2026  
**Versão:** 1.3.0 - Adicionado estratégia de ambientes, deploy e workflow de branches
