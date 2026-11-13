# Correções de layout e responsividade

## Causas identificadas nas imagens e no código

1. Os indicadores do Normatic herdavam `grid-column: span 2` de uma grade antiga de 12 colunas. A integração usava três colunas, fazendo os indicadores quebrarem em linhas separadas. Também permaneciam posições de linha e alturas mínimas do painel anterior de documentos/reuniões/atas.
2. O FAROL carregava estilos globais legados depois dos componentes Normatic, sobrescrevendo `.toolbar`, campos e botões. O CSS legado passou a uma camada de menor precedência (`farol-legado`). Os componentes reaproveitados mantêm seus estilos próprios; as barras de ferramentas exclusivas de atividades recebem seu layout flexível local.
3. Botões de filtros, menus e paginação estavam definidos em `documentos.css`, não carregado no FAROL. Esses blocos foram extraídos para `componentes.css`, utilizado pelos dois módulos, sem duplicar o CSS inteiro da tela de documentos.
4. O manipulador `toggleAcoes` também estava no módulo de documentos, ausente no FAROL. Agora está em `js/shared/acoes-menu.js`, carregado nos dois módulos.

## Resultado implementado

- Indicadores compactos lado a lado, painéis sem posições ou alturas mínimas herdadas e adaptação para uma ou duas colunas nas telas menores.
- Filtros em grid, rótulos alinhados, controles com altura consistente e botões Limpar/Exportar compartilhados.
- Filtros e calendário em cartões separados, com espaçamentos explícitos, sem margens negativas.
- Atas com linhas compactas, colunas proporcionais, pauta e identificação truncadas com texto completo no atributo `title`, indicadores de situação e paginação padronizados.
- Menu de três pontos com Editar ata, Exportar ata e Excluir ata. O painel é movido temporariamente ao `body`, usa posição fixa dentro da janela e volta ao local original ao fechar. Assim não depende do overflow das tabelas. Há suporte a Escape, setas, Home/End, Tab e fechamento ao clicar fora, rolar ou redimensionar.
- Tabela de reuniões adapta todos os campos em cartões identificados nas larguras menores, sem precisar esconder funcionalidades ou forçar uma tabela com largura mínima de 1080 px.
- `calendarios.css` compartilha dimensões, cores, dias da semana, navegação, destaque de hoje e seleção. Os dois calendários exibem somente as semanas necessárias, com células compactas e sem largura mínima de 560 px no celular. O resumo mostra até dois eventos por célula; a seleção da data permite consultar todos os registros.
- Seção Sobre retirada do HTML e da navegação do Normatic. Um favorito antigo `#sobre` passa a mostrar o dashboard.

## Validação

As suítes de regras, persistência, integração DOM, recursos e layout foram executadas. Os testes de layout exercitam o menu de atas (editar, abrir exportação e excluir), paginação com 12 registros isolados, menus de reuniões, navegação de meses, seleção de dias e estados dos calendários. As regras CSS são avaliadas no DOM para 390, 768, 1024 e 1440 px, verificando grades, alturas mínimas e ausência das larguras mínimas problemáticas.

Esses testes de estilos não executam um motor visual: não medem pixels efetivamente renderizados nem comprovam ausência de sobreposição em um navegador. Não havia navegador conectado na sessão; a inspeção visual real nessas resoluções permanece pendente. Os HTMLs com recursos embutidos foram regenerados a partir dos arquivos corrigidos.

Não foram alterados cadastros, chaves de armazenamento, dados reais, regras de vigência, filtros ou cálculos. As massas de teste ficam isoladas em memória.
