# Yandeh Marketplace

Marketplace B2B onde compradores (farmácias, mercados, restaurantes) fazem pedidos para fornecedores com preços por faixa de quantidade e validação de pedido mínimo.

## Stack

- **Frontend**: Vue 3 + TypeScript + Pinia + Vue Router
- **Backend**: Node.js + TypeScript + Express + Drizzle ORM
- **Banco**: PostgreSQL 15

## Quick Start

```bash
# Subir todos os serviços (frontend + backend + postgres)
docker compose up -d

# Aguardar inicialização (~30s)
# - Frontend: http://localhost
# - Backend API: http://localhost:3000
# - PostgreSQL: localhost:5432
```

O backend executa automaticamente as migrations e seed data na inicialização.

## URLs

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:3000 |
| PostgreSQL | localhost:5432 |

## Comandos Docker

```bash
# Subir serviços
docker compose up -d

# Ver logs
docker compose logs -f

# Parar serviços
docker compose down

# Reconstruir imagens
docker compose up --build -d

# Resetar banco de dados
docker compose down -v && docker compose up -d
```

## Desenvolvimento Local (sem Docker)

As imagens Docker fazem apenas build (não há hot-reload via volume montado), então para
iterar com reload automático rode os serviços fora do container:

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Estrutura

```
.
├── backend/           # API REST
│   ├── src/
│   │   ├── domain/    # Lógica de negócio pura
│   │   ├── services/  # Orquestração + I/O
│   │   ├── routes/    # HTTP handlers
│   │   └── db/        # Schema + migrations
│   └── Dockerfile
├── frontend/          # SPA Vue 3
│   ├── src/
│   │   ├── views/     # CatalogView, CartView, OrdersView
│   │   ├── components/# ProductCard, CartItem, etc.
│   │   ├── stores/    # Pinia cart store
│   │   └── services/  # API client
│   └── Dockerfile
└── docker-compose.yml
```

## Testes

Com os serviços já de pé via `docker compose up -d`, rode direto no container do backend
(não precisa de `npm install` local):

```bash
docker compose exec backend npm test
```

Se preferir rodar localmente (fora do Docker), veja [Desenvolvimento Local](#desenvolvimento-local-sem-docker):

```bash
cd backend
npm install
npm test
```

## Comandos úteis (dentro dos containers)

```bash
# Rodar a seed novamente (já roda automaticamente ao subir o backend)
docker compose exec backend npm run db:seed

# Abrir um shell no container do backend
docker compose exec backend sh

# Ver logs de um serviço específico
docker compose logs -f backend
docker compose logs -f frontend
```

## Seed Data

O banco é populado automaticamente com:
- 1 comprador (Farmácia Central)
- 1 fornecedor (Distribuidora Farma, mínimo R$100)
- 3 produtos com 3 faixas de preço cada
