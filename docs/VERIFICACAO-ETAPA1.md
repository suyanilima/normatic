# Verificação da etapa 1

## Testes automatizados

`npm test` executa:

1. `tests/regras.test.cjs`: regras preexistentes de vigência, datas, validação, normalização, participantes, reuniões, atas e persistência de normativos.
2. `tests/farol-storage.test.cjs`: cadastro, atualização, exclusão, status, integridade dos vínculos, renomeação de responsável, lotes atômicos, datas/horários inválidos, falta de espaço e proteção de conteúdo corrompido.
3. `tests/integracao.test.cjs`: inicialização dos HTMLs com seus scripts reais, sem recursos externos; documentos sem normativo e normativos com vigência; pesquisa, edição, consulta, exclusão e seleção para relatórios; CRUD de atividades, filtros de status e persistência após reabrir; compromissos de data única e em lote; reuniões existentes, novas reuniões, edição de pauta, remarcação, cancelamento, filtros e seleção para relatórios; agenda compartilhada; geração manual e conclusão de ata; geração de DOCX e PDF; separação dos cadastros e proteção dos dados de normativos durante o uso do FAROL.
4. `tests/arquivos.test.cjs`: referências de recursos locais, identificadores HTML únicos e ausência de dependências locais nas versões com recursos embutidos. A integração DOM também verifica a inicialização dessas duas versões e os links entre elas.

Resultado da execução da etapa 1: as quatro suítes passaram. `npm run build` gerou os dois HTMLs com recursos embutidos. As rotas `/` e `/farol.html` do servidor local responderam HTTP 200.

Na revisão de layout foi adicionada uma quinta suíte, `tests/layout.test.cjs`. Os testes e limites da revisão estão documentados em [Correções de layout](CORRECOES-LAYOUT.md).

O DOM é executado em jsdom, com dados de teste isolados. Diálogos nativos, rolagem e `innerText` recebem equivalentes de teste porque não há motor de layout. O canvas da biblioteca PDF não é renderizado. A geração de bytes de DOCX/PDF é verificada, mas sua apresentação visual não é avaliada por esses testes.

## Correções encontradas na conferência

- Campos obrigatórios das datas múltiplas do FAROL eram validados mesmo ocultos, bloqueando compromissos de data única. A alternância agora controla também `disabled` e `required`.
- O configurador de relatórios tentava preencher filtros retirados de sua própria marcação. Mantida a seleção da listagem e eliminadas as referências a elementos inexistentes.
- O fechamento de modais referenciava funções de todos os domínios ao mesmo tempo. Agora resolve apenas o fechador do modal aberto, permitindo separar os módulos sem erros de referência.
- Responsáveis inativos continuam disponíveis como valor selecionado na edição dos vínculos existentes.
- A falha de IA não produz mais uma ata provisória simulada. O conteúdo original é preservado e a revisão manual continua disponível.

## Limites da verificação

Não havia navegador conectado no ambiente (a descoberta retornou lista vazia). Portanto não houve inspeção visual real de desktop/celular, interação com o seletor nativo de datas, conferência visual dos arquivos exportados ou teste de impressão/clipboard no navegador. A responsividade foi preservada no código e adaptada com media queries, mas requer homologação visual em navegador real antes de considerar essa parte validada.

Não houve acesso a banco, planilha ou dados de produção. Supabase, login, SMTP, Google Agenda e publicação estão fora do escopo e não foram testados nem ativados.
