# Teste Prático — Desenvolvedor(a) Fullstack Júnior

**Esforço esperado: 8–12h · O prazo de entrega está no e-mail de envio deste teste**

Bem-vindo(a)! Este desafio simula um recorte real do nosso produto. Leia tudo antes de começar — especialmente a seção **Entregáveis**, porque o que mais avaliamos não é o código em si, e sim as **razões por trás das suas decisões**.

---

## Contexto

Você vai construir um recorte mínimo de um **marketplace B2B**: compradores (farmácias, mercados, restaurantes) fazem pedidos para fornecedores (indústrias e distribuidores). Diferente do e-commerce comum, aqui existem regras comerciais por fornecedor:

- Cada **fornecedor** define um **pedido mínimo** (valor em R$). Pedidos abaixo do mínimo não podem ser fechados.
- Produtos têm **preço por faixa de quantidade** (ex.: 1–9 un → R$ 10,00; 10–49 un → R$ 8,50; 50+ un → R$ 7,20).
- Um **pedido** pertence a um comprador e a um único fornecedor, e tem itens com quantidade e preço aplicado.

## O que construir

**Backend (API REST)**
- CRUD de produtos do fornecedor (com faixas de preço)
- Criação de pedido: recebe comprador, fornecedor e itens; calcula preços pelas faixas; valida pedido mínimo; persiste
- Listagem de pedidos com itens

**Frontend**
- Tela de catálogo: produtos do fornecedor com faixas de preço visíveis
- Tela de carrinho/pedido: montar o pedido, ver o total atualizar conforme quantidades mudam, ver claramente quando o pedido mínimo não foi atingido, e fechar o pedido
- Tela de listagem de pedidos

**Banco de dados**
- Relacional (PostgreSQL preferido). A modelagem é parte central da avaliação.

## Stack

Preferimos **Vue + Node/TypeScript + PostgreSQL** (nossa stack), mas aceitamos equivalentes (React, NestJS, etc.). Se fugir da stack preferida, explique o porquê no `DECISIONS.md`.

## Entregáveis

1. **Repositório** (GitHub, público ou com acesso concedido) com instruções de setup que funcionem. `docker compose up` é o ideal; um README que exige 40 minutos de setup manual conta contra você.

2. **`DECISIONS.md`** — o entregável mais importante. Para cada decisão relevante, escreva:
   - O que você decidiu
   - Que alternativas considerou e por que descartou
   - O que muda se o sistema crescer muito (onde essa decisão quebra primeiro)

   Decisões que esperamos ver discutidas: como você modelou as faixas de preço, onde vive a validação de pedido mínimo (front, back, banco, ou mais de um — e por quê), a estrutura do pedido no banco, e **qualquer ponto do enunciado que você achou ambíguo e como resolveu**. Se algo no enunciado permitir mais de uma interpretação, não pergunte: decida, e documente sua premissa.

3. **`AI.md`** — o uso de IA é **permitido e esperado**. Descreva: quais partes você gerou com IA, como validou, o que a IA errou e você corrigiu. Não avaliamos "usou pouco = bom". Avaliamos consciência sobre o que você está entregando.

## Conversa final

Depois da entrega, teremos uma **conversa de 30–40 minutos** onde você apresenta suas decisões e faremos perguntas sobre o código — incluindo uma pequena modificação ao vivo. Essa conversa é parte da avaliação, então entregue algo que você domina, não algo que você não saberia explicar.

## O que NÃO precisa

- Autenticação/login (assuma um comprador e um fornecedor fixos, ou um seletor simples)
- Deploy em produção
- Cobertura total de testes (mas testes nos pontos que você julga críticos são bem-vindos — a escolha de *onde* testar diz muito)
- Design visual elaborado — funcional e claro basta

## Dica final

Se o tempo apertar, prefira **entregar menos escopo com decisões bem explicadas** a entregar tudo sem conseguir justificar. Corte consciente documentado no `DECISIONS.md` é visto como sinal positivo.

Boa sorte!
