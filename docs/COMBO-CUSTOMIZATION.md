# Combo Customization — Substituição de Produtos

## Visão Geral

Combos no Ohana Sushi podem ter produtos **fixos** ou **customizáveis**. Quando um produto é marcado como customizável, o cliente pode substituí-lo por outro produto pré-aprovado, possivelmente com um custo adicional.

**Exemplo prático:**

- "Combo Premium" inclui 4 niguiris de salmão
- O salmão é marcado como `isCustomizable: true`
- Substituições permitidas: atum (+R$ 5,00), polvo (+R$ 8,00)
- O cliente, ao pedir o combo, pode trocar o niguiri de salmão pelo de atum pagando R$ 5,00 a mais
- Outros itens do combo (como o uramaki filadélfia) podem estar como `isCustomizable: false` — vêm fixos

## Modelo de Dados

A feature envolve três tabelas conectadas:

```
Combo (1) ────< ComboProduct (N) ────< ComboProductSubstitution (N) >──── Product
```

### `ComboProduct`

Representa cada produto que compõe um combo, com a flag de customização:

```prisma
model ComboProduct {
  id             Int       @id @default(autoincrement())
  comboId        Int
  productId      Int       // produto "padrão" do combo
  quantity       Int
  order          Int
  isCustomizable Boolean   @default(false)  // ← chave da feature
  substitutions  ComboProductSubstitution[]
}
```

### `ComboProductSubstitution`

Define quais produtos podem substituir cada `ComboProduct` customizável, e o custo extra de cada troca:

```prisma
model ComboProductSubstitution {
  id                  Int     @id @default(autoincrement())
  comboProductId      Int
  substituteProductId Int     // produto alternativo permitido
  extraCost           Decimal @db.Decimal(10, 2)  // custo adicional pela troca
}
```

## Comportamento Esperado

| Cenário | Resultado |
|---------|-----------|
| `isCustomizable: false` | Produto fixo, cliente não pode trocar |
| `isCustomizable: true` + sem `substitutions` cadastradas | Cliente pode remover o item, mas não há alternativas |
| `isCustomizable: true` + `substitutions` cadastradas | Cliente pode trocar pela lista de alternativas, com o `extraCost` somado ao preço final |

## Estado Atual (2026-05-13)

### Backend
- ✅ Schema Prisma define a estrutura completa (`ComboProduct.isCustomizable` + `ComboProductSubstitution`)
- ✅ Endpoints aceitam `isCustomizable` ao criar/atualizar combos
- ❌ CRUD da tabela `ComboProductSubstitution` ainda não implementado (não há endpoints para gerenciar substituições)

### Admin (Angular)
- ❌ CRUD de combos com seleção de produtos: pendente
- ❌ UI para marcar produtos como customizáveis e cadastrar substituições: pendente

### Frontend (cliente)
- ❌ UI para o cliente trocar produtos no combo durante o pedido: pendente
- ❌ Cálculo do `extraCost` no carrinho: pendente

## Próximos Passos

1. Implementar CRUD de Combo no admin, incluindo:
   - Seleção de produtos (com `quantity`, `order`, `isCustomizable`)
   - Para produtos marcados como customizáveis, sub-formulário para cadastrar `ComboProductSubstitution`
2. Criar endpoints REST para gerenciar `ComboProductSubstitution` (create, update, delete)
3. No frontend cliente, exibir UI de "personalizar combo" quando houver produtos customizáveis
4. Calcular preço total considerando substituições escolhidas
