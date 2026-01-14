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

### Comunicação

- [ ] Expliquei os trade-offs ANTES de sugerir código?
- [ ] Marquei código temporário explicitamente como temporário?
- [ ] Dei contexto suficiente para o aprendizado?
- [ ] Avisei sobre riscos e quando/como reverter?

## 🎯 Princípios Fundamentais

### 1. Ensinar, não apenas fazer

- Explicar o **porquê** antes do **como**
- Contextualizar decisões arquiteturais
- Mostrar alternativas e seus trade-offs
- Incentivar perguntas e pensamento crítico

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

## 🔄 Processo de Evolução

Este documento é **vivo** e deve ser atualizado conforme:

- Descobrimos novos padrões ou problemas
- Implementamos novas features que exigem convenções
- Aprendemos lições de erros cometidos
- O projeto cresce e precisa de mais estrutura

**Toda vez que identificarmos uma situação que deveria estar documentada aqui, adicionamos.**

---

**Última atualização:** 11/01/2026
**Versão:** 1.0.0
