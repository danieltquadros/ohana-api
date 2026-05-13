# GraphQL API Documentation

## 🚀 Acesso ao GraphQL Playground

Quando o servidor estiver rodando (`npm run start:dev`), acesse:

```
http://localhost:3000/graphql
```

## 📚 Schema

O schema GraphQL é gerado automaticamente usando **Code First approach** com decorators TypeScript.

### Object Types

#### ProductType

```graphql
type ProductType {
  id: Int!
  name: String!
  order: Int!
  inUse: Boolean!
}
```

#### Product

```graphql
type Product {
  id: Int!
  title: String!
  image: String!
  price: Float!
  order: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
  productTypeId: Int!
  type: ProductType!
  ingredients: [Ingredient!]!
}
```

#### Ingredient

```graphql
type Ingredient {
  id: Int!
  name: String!
  quantity: Int!
  productId: Int!
}
```

## 🔍 Queries

### ProductTypes

```graphql
# Buscar todos os tipos de produto
query {
  productTypes {
    id
    name
    order
    inUse
  }
}

# Buscar um tipo de produto por ID
query {
  productType(id: 1) {
    id
    name
    order
    inUse
  }
}
```

### Products

```graphql
# Buscar todos os produtos
query {
  products {
    id
    title
    price
    order
    type {
      name
    }
    ingredients {
      name
      quantity
    }
  }
}

# Buscar um produto por ID
query {
  product(id: 100) {
    id
    title
    price
    image
    order
    type {
      id
      name
    }
    ingredients {
      name
      quantity
    }
  }
}
```

## ✏️ Mutations

### ProductTypes

```graphql
# Criar tipo de produto
mutation {
  createProductType(
    createProductTypeInput: { name: "BEBIDAS", order: 14, inUse: true }
  ) {
    id
    name
    order
    inUse
  }
}

# Atualizar tipo de produto
mutation {
  updateProductType(
    updateProductTypeInput: { id: 1, name: "TODOS", order: 1 }
  ) {
    id
    name
    order
    inUse
  }
}

# Remover tipo de produto
mutation {
  removeProductType(id: 14) {
    id
    name
  }
}
```

### Products

```graphql
# Criar produto
mutation {
  createProduct(
    createProductInput: {
      title: "Combo Teste"
      image: "https://example.com/image.jpg"
      price: 49.90
      order: 1
      productTypeId: 2
      ingredients: [
        { name: "Salmão", quantity: 5 }
        { name: "Cream cheese", quantity: 2 }
      ]
    }
  ) {
    id
    title
    price
    type {
      name
    }
    ingredients {
      name
      quantity
    }
  }
}

# Atualizar produto
mutation {
  updateProduct(
    updateProductInput: { id: 100, title: "Combo Atualizado", price: 59.90 }
  ) {
    id
    title
    price
  }
}

# Remover produto
mutation {
  removeProduct(id: 100) {
    id
    title
  }
}
```

## 🎯 Vantagens do GraphQL

### 1. **Queries Flexíveis**

- Cliente solicita apenas os campos necessários
- Reduz over-fetching e under-fetching
- Uma única chamada pode trazer dados relacionados

### 2. **Type Safety**

- Schema fortemente tipado
- Validação automática de queries
- Autocomplete no Playground

### 3. **Documentação Automática**

- Schema auto-documentado
- Exploração interativa no Playground
- Sempre sincronizado com o código

### 4. **Compatibilidade com REST**

- APIs REST continuam funcionando normalmente
- GraphQL e REST coexistem
- Migração gradual possível

## 🛠️ Estrutura do Código

```
src/
├── products/
│   ├── entities/
│   │   ├── product.entity.ts        # ObjectType GraphQL
│   │   └── ingredient.entity.ts     # ObjectType GraphQL
│   ├── dto/
│   │   ├── create-product.input.ts  # InputType GraphQL
│   │   ├── update-product.input.ts  # InputType GraphQL
│   │   ├── create-product.dto.ts    # DTO REST (mantido)
│   │   └── update-product.dto.ts    # DTO REST (mantido)
│   ├── products.resolver.ts         # Resolver GraphQL
│   ├── products.controller.ts       # Controller REST (mantido)
│   ├── products.service.ts          # Lógica compartilhada
│   └── products.module.ts           # Registra Resolver + Controller
└── product-types/
    └── (estrutura similar)
```

## 📝 Convenções

### Naming

- **Queries**: Nome do recurso no plural (`products`, `productTypes`)
- **Mutations**: Verbo + recurso (`createProduct`, `updateProductType`)
- **Input Types**: Sufixo `Input` (`CreateProductInput`)
- **Object Types**: Nome do modelo (`Product`, `ProductType`)

### Validação

- Input Types usam mesmos validators do `class-validator`
- Validação automática via `ValidationPipe`
- Erros retornados em formato GraphQL

## 🔐 Autenticação (Futuro)

Para adicionar autenticação ao GraphQL:

1. Criar guards personalizados
2. Aplicar decorators `@UseGuards()` nos resolvers
3. Usar context do Apollo Server para passar dados do usuário

```typescript
@Query(() => [Product])
@UseGuards(JwtAuthGuard)
findAll(@CurrentUser() user: User) {
  return this.productsService.findAll(user.id);
}
```

## 🧪 Testando

### Queries de Exemplo

```graphql
# Query completa com todas as relações
{
  products {
    id
    title
    price
    type {
      name
      order
    }
    ingredients {
      name
      quantity
    }
  }
}

# Query otimizada - só o necessário
{
  products {
    id
    title
    price
  }
}
```

### Variables

```graphql
query GetProduct($id: Int!) {
  product(id: $id) {
    title
    price
  }
}

# Variables:
{
  "id": 100
}
```

---

**Documentação gerada automaticamente**: O schema completo pode ser explorado no GraphQL Playground em `/graphql`.
