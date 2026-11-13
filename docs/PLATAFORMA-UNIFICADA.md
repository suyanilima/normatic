# Plataforma unificada

## Análise e organização

A navegação atual usa duas páginas com motores JavaScript globais que possuem funções homônimas (`render`, `setTab`, `renderDashboard`). A unificação preserva esses motores: a página principal assume a navegação única, enquanto as telas documentais existentes são incorporadas como um componente da mesma origem, sem menu próprio. Isso evita misturar estados e alterar regras de cadastro para resolver colisões de nomes.

O armazenamento continua nas mesmas chaves e na mesma origem. O componente documental mantém suporte ao adaptador `window.storage` preexistente. Não há migração, backend ou autenticação nova.

Reuniões mantém unidades, membros, pautas, filtros, relatórios e listagem; seu calendário sai da interface. Compromissos passam a ter cadastro, listagem, consulta, edição e exclusão nessa área. A Agenda é o único calendário, com filtros por reuniões, compromissos e prazos. O painel apresenta os indicadores documentais existentes e os indicadores de atividades, sem recalcular ou substituir suas regras.

Os endereços antigos FAROL continuam como redirecionamentos de compatibilidade para a página principal. Os HTMLs com recursos incorporados serão regenerados, incluindo o componente documental.

## Implementação

- `js/plataforma/app.js`: menu único, roteamento, painel, compromissos e filtros da Agenda.
- `js/plataforma/documental.js` e `contexto-documental.js`: contrato do componente documental, navegação, altura, modais e adaptador opcional de armazenamento. As mensagens são verificadas pela origem e pela janela emissora.
- O componente documental usa a mesma origem e é mantido no DOM ao alternar áreas; os rascunhos não são descartados. O isolamento impede colisões entre os motores existentes, sem transformar os cadastros em telas ilustrativas.
- `js/plataforma/redirecionar.js`: compatibilidade para links antigos FAROL.
- A entrada com recursos incorporados embute o HTML documental em `srcdoc`, evitando dependências de um segundo arquivo para essa tela. Os arquivos originais não precisam de build para executar pelo servidor local.

## Validação

Além das cinco suítes anteriores, `tests/unificada.test.cjs` verifica o menu único, a ausência do calendário duplicado, os quatro tipos de registro e os filtros da Agenda, o cadastro/edição/exclusão e a pesquisa de compromissos, unidades com membros e periodicidade, criação de reunião vinculada a unidade, acesso ao componente documental e preservação de rascunho ao alternar áreas. Também verifica o painel com dados documentais preexistentes, ausência de regravação desses dados, contrato de dimensionamento de modais, redirecionamento antigo e inclusão integral do componente no build.

Os testes executam o DOM e as regras de estilos, sem um motor de renderização visual. Não houve inspeção visual em navegador real nesta sessão. A inicialização do componente no HTML modular é exercitada com seus scripts reais; no protótipo, é conferido que o HTML embutido corresponde integralmente ao componente gerado. O comportamento visual de `srcdoc`, impressão, seleção nativa de datas e área de transferência requer conferência em navegador real.
