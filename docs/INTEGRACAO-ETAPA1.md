# Integração Normatic / FAROL — etapa 1

## Análise anterior à implementação

O Normatic é um frontend estático, com módulos JavaScript separados e sem dependências npm. Documentos usam `igov:documentos` (ou `window.storage` quando disponível); reuniões, unidades e atas usam `igov:reunioes`, `igov:unidades-reuniao` e `igov:minutas` no localStorage. O formulário de cadastro mistura documentos e reuniões; o painel e a apresentação também misturam os dois domínios.

O ZIP do FAROL contém uma interface funcional em um HTML, quatro cadastros (projetos, tarefas, responsáveis e compromissos), calendário, prioridades, status, paginação de projetos e compromissos em várias datas. O adaptador fornecido exige Supabase, OTP, Realtime e Google. Não há um armazenamento local anterior no pacote. As instruções do README desse ZIP são material de referência para uma etapa futura, não autorização para configurar esses serviços agora.

## Reaproveitamento e separação

- Manter os cadastros, filtros, relatórios e regras de vigência de documentos no Normatic.
- Transferir os formulários, painéis e diálogos de reuniões, unidades, pautas e atas para `farol.html`, usando os módulos existentes de `js/reunioes` e `js/minutas`.
- Reaproveitar o código do FAROL, separando HTML, CSS, interface e adaptador de persistência. Usar localStorage nesta etapa, sem acessar Supabase ou Google.
- Usar uma única agenda do FAROL para compromissos, projetos, tarefas e reuniões. A pauta permanece no cadastro da reunião, sem novo cadastro duplicado.
- Manter as chaves existentes das reuniões e atas: não copiar, renumerar nem migrar os registros. Os módulos precisam ser servidos pela mesma origem.
- Preservar o pacote FAROL e uma cópia do HTML original Normatic em `referencias` antes de modificar as telas.
- Compartilhar tokens visuais e o estilo da navegação; preservar a aparência dos formulários do Normatic.

## Limites desta etapa

Sem autenticação definitiva, Supabase, envio de e-mail, Google Agenda ou publicação. Os arquivos de preparação do ZIP ficam apenas como referência, fora da aplicação executada. O adaptador de dados é o ponto de substituição futuro por um backend compartilhado.

## Validação prevista

Executar os testes de regras existentes, testes do adaptador local (CRUD, vínculos, persistência, lote e falhas), conferência de recursos locais e testes dos fluxos no navegador quando disponível. Registrar os resultados reais e as limitações na entrega.
