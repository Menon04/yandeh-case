# Decisões

## Inicio:

Primeiramente antes de modelar ou dar o primeiro passo em codigo ou algo do tipo, eu me questionei qual era o intuito do case. A primeira coisa que pensei foi tentar trazer para uma relação de cliente e prestador. Onde o cliente era o case (com prazo de entrega e tudo definido certinho), então eu priorizei o que foi pedido, entregar algo funcional sem muita volta ou overengeneering, porem sempre anotando os pontos de melhoria para uma "segunda entrega" (caso fosse um case de verdade), onde eu sei que é uma possivel melhoria, onde futuramente pode dar algum problema mas a primeira vista, não é prioridade, não é o que agrada o usuário final.

## Modelagem:

======================================================================================================
1 - Comprador sem autenticação, apenas um switch para trocar a role, sem tabelas apenas ids no codigo para podermos ir de fato onde queremos.

- Foi desconsiderado ter tabelas complexas pois o enunciado marca como fora do escopo, e isso foi interpretado como um sinal de prioridade do cliente. Mantive as tabelas no banco para ter uma referencia com uma fk real, evitando problemas de logica

- Isso quebra quando o sistema precisar de mais usuarios para funcionar, as tabelas ja existem mas precisariam de migrations

======================================================================================================
2 - Preço do pedido é congelado no momento da criação, não recalculado depois pela tabela de faixas de preço.

- Foi desconsiderado recalcular o preço toda vez que o pedido é aberto, pois se o fornecedor mudar a faixa de preço depois, o pedido antigo mudaria de valor sozinho. Isso não faz sentido pra um pedido que já foi fechado. Mantive uma referência da faixa usada só pra consulta/auditoria, mas o preço que conta é o congelado.

- Isso quebra se precisarmos de um carrinho salvo no banco antes de fechar o pedido, aí faria sentido o preço acompanhar mudanças até a confirmação final

======================================================================================================
3 - Validação de pedido mínimo no frontend e no backend, cada um com um papel diferente.

- Foi desconsiderado deixar só no frontend, pois isso não impede ninguém de mandar o pedido direto pela API. O frontend serve só pra avisar o usuário na hora ("pedido ta faltando x reais para ser valdio"), quem realmente barra o pedido é o backend.

- Isso quebra se o cálculo do total mudar (tipo somar frete ou imposto), porque aí a regra precisa ser atualizada nos dois lugares e pode ficar desalinhada se esquecermos um dos dois.

======================================================================================================

4 - Faixas de preço em tabela separada (price_tiers), não em colunas fixas no produto nem em JSON.

- Foi desconsiderado usar colunas fixas (tipo price_tier1, price_tier2, price_tier3), pois isso trava o produto em sempre ter exatamente 3 faixas e acredito que deixar muito engessado nao fosse uma boa ideia.

- Isso quebra se precisarmos garantir no banco que as faixas não se sobrepõem ou não têm buracos entre elas, hoje essa validação é feita só na aplicação, não no banco.

======================================================================================================

## Backend

1 - Lógica de negócio separada em domain/service.

- Foi desconsiderado colocar o cálculo de preço e a validação de mínimo direto na rota, pois isso obrigaria simular uma requisição HTTP inteira só pra testar a regra de negócio. os domibios tem só funções puras (sem banco, sem I/O), e service orquestra o acesso ao banco chamando essas funções, gosto dessa arquiterura de abstrair em camadas e arquivos bem centrados no processo.

- Isso quebra se a regra de negócio crescer muito e passar a depender de múltiplas fontes de dado ao mesmo tempo (tipo consultar outro serviço externo no meio do cálculo), aí a fronteira "domain não sabe que banco existe" fica mais difícil de manter limpa.

2 - Rotas de produto sem aninhamento (/products), nao utilizando o /suppliers/:id/products.

- Foi desconsiderado aninhar a rota no fornecedor, pois no escopo do teste só existe um fornecedor fixo. A relação produto-fornecedor já é garantida pela FK no banco, não precisa aparecer na URL.
  Ao meu ver colocar o supplier id na rota expoe uma coisa desnecessaria no momento

- Isso quebra quando o sistema precisar de múltiplos fornecedores reais consumindo a API, faznedo com que nao se sustente essa ecolha, e acabaria fazendo sentido migrar pra /suppliers/:supplierId/products pra deixar o escopo explícito.

======================================================================================================

3 - Garantia de pedido válido é feito validando em várias camadas, não só confiando no dado que chega.

- Foi desconsiderado confiar só no valor calculado antes de persistir. O pedido é validado de novo dentro da própria transação, se nao tiver batendo a quantidade ou a faixa de preco. Alem disso me atentei em colocar uma chave no pedido para caso a rede falhe, ou demore a ocorrer a confirmacao, o usuario nao pagar a mesma coisa duas vezes, tirando a logica do frontend

- Isso quebra se o negócio precisar de um fluxo mais flexível, tipo permitir pedido "incompleto" pra completar depois, ou aceitar faixas de preço parciais, hoje o sistema é bem quadrado.

======================================================================================================

## Frontend

1 - Carrinho vive num store global, não em estado local de componente.

- Foi desconsiderado guardar o carrinho como estado local da tela de carrinho, pois catálogo e carrinho são páginas separadas, o usuário adiciona produto numa tela e revisa/fecha em outra. Manter isso local exigiria ficar passando o carrinho artificialmente colcoando uma complexidade desncessária, com global qualquer tela altera o carrinho

- Isso quebra se o carrinho precisar sobreviver a um refresh de página, hoje ele é só em memória, se a página recarregar o carrinho fica vazio e nâo salva nada.

======================================================================================================

2 - Total e validação de mínimo calculados no backend (endpoint de preview), não no frontend.

- Foi desconsiderado calcular o total no próprio frontend (já que os preços das faixas já vem no catálogo). A regra de cálculo de preço já existe no backend, duplicar ela em JS no frontend criaria dois lugares pra manter sincronizados toda vez que a regra mudasse o que nao faz sentido nenhum ao meu ver, ja que isso esta sendo resolvido do lado do servidor

- Isso quebra se a latência de rede virar um problema real (conexão ruim, muita gente usando ao mesmo tempo), aí faria sentido calcular localmente e confiar só no backend na hora de fechar o pedido de fato.

======================================================================================================

3 - Chave gerada só no momento do clique em "fechar pedido".

Foi desconsiderado gerar essa chave mais cedo (tipo se o usuário clica no carrinho e comeca a adicionar alguma coisa lá). Só é gerada quando o usuario fecha o pedido, e ai sim isso é passado para frente

Isso não quebra de fato, é a forma mais simples de garantir que clique duplo ou falha de rede não gere pedido duplicado.

======================================================================================================
