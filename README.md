# Normatic — plataforma integrada

Normativos e atividades agora compartilham uma página principal e um único menu. Não é preciso alternar entre Normatic e FAROL.

## Executar

O acesso da equipe usa senha e aplicativo autenticador. Para exigir a segunda etapa também no banco, siga [a ativação do MFA](docs/MFA.md) e aplique a segunda migração SQL.

Os lembretes por e-mail de tarefas e reuniões estão preparados, mas desligados até configurar o provedor, as variáveis de servidor e a terceira migração. Veja [o guia de e-mails](docs/EMAIL.md).

Com Node.js instalado, abra o terminal na pasta do projeto:

```sh
npm start
```

Acesse **http://localhost:4173**. Não é necessário instalar dependências para executar a aplicação. Mantenha o mesmo navegador, perfil, host, protocolo e porta usados anteriormente para acessar os dados locais existentes.

## Organização

| Área | Recursos |
| --- | --- |
| Painel | Indicadores documentais existentes, projetos, tarefas, responsáveis, prioridades, reuniões e atas |
| Normativos | Pesquisa, cadastro, edição, exclusão, vigências, regularização, histórico e relatórios |
| Projetos | Cadastro e acompanhamento dos projetos e suas tarefas |
| Tarefas | Cadastro, responsáveis, prazos, prioridades e status |
| Agenda | Calendário único com filtros por reuniões, compromissos e prazos de projetos/tarefas |
| Reuniões e compromissos | Listagens, filtros, Nova reunião, Novo compromisso e acesso a Unidades e nova reunião |
| Atas | Criação manual, revisão, conclusão, edição, exclusão e exportação Word/PDF |
| Responsáveis | Cadastro e acompanhamento das pessoas e suas tarefas |
| Busca global | Pesquisa unificada por documentos, reuniões, atas, tarefas, projetos e responsáveis (Ctrl+K) |
| Notificações | Pendências de documentos, reuniões futuras e atas não registradas, com filtros e marcação de lidas |
| Auditoria | Trilha de acessos, criações, edições e exclusões — restrita a administradores |

Em **Reuniões e compromissos**, o botão **Novo compromisso** abre o formulário preservado, incluindo várias datas. A opção **Compromissos** permite pesquisar, consultar, editar e excluir registros. A opção **Unidades e nova reunião** mantém periodicidades, membros, cargos e convidados. A listagem de reuniões preserva pautas, participantes, formato, SEI, remarcação, cancelamento e relatórios.

A **Agenda** apenas visualiza os registros e permite consultar/editar os existentes. O cadastro de novos compromissos fica na área de reuniões. Não há segundo calendário na tela de Reuniões, nem cópias de reuniões no cadastro de compromissos.

## Preservação dos dados

- Documentos: `igov:documentos`, mantendo o adaptador opcional `window.storage`.
- Reuniões/pautas: `igov:reunioes`.
- Atas: `igov:minutas`, com o limite preexistente de 50 registros.
- Unidades: `igov:unidades-reuniao`.
- Atividades e compromissos: `farol:dados:v1`.

Não houve migração ou exclusão de dados. Mudar a origem do endereço muda o armazenamento acessível, sem apagar os dados na origem anterior. O ZIP FAROL original não continha registros da planilha/banco anterior; esses dados externos continuam sem importação automática. A aplicação não insere exemplos.

## Arquivos e arquitetura

`index.html` é a plataforma. `normativos.html` reutiliza o motor documental como componente incorporado da mesma origem, sem segundo menu. Isso preserva as funções e os estados documentais sem colisões com o motor de atividades. O componente é mantido durante a navegação para preservar rascunhos. Os diálogos e menus documentais se ajustam à área visível da plataforma.

`farol.html` apenas redireciona links antigos para a plataforma, preservando a aba. As cópias anteriores e o pacote original, quando disponíveis localmente, ficam em `arquivo/referencias/`. Os ZIPs anteriores ficam em `arquivo/entregas/`. Esses arquivos históricos são ignorados pelo Git e não acompanham novos clones.

A integração com Supabase e login de equipe está ativada, utilizando dados compartilhados e sem importação automática dos registros locais. O acesso exige login com e-mail e senha, seguido de verificação MFA (TOTP). A barra lateral inclui busca global, notificações de pendências e, para administradores, uma trilha de auditoria. Siga [o guia do Supabase](docs/SUPABASE.md) para configurar uma nova instalação. São cinco migrações SQL: equipe, MFA, e-mail, gravação incremental e auditoria. E-mails automáticos, Google Agenda e publicação não foram implementados. A preferência de convite é preservada, mas não envia convites. A edição manual de atas funciona sem serviços; o ponto de IA preexistente permanece indisponível sem configuração, sem gerar conteúdo simulado.

## Testar e gerar arquivos com recursos incorporados

Os testes usam Node.js e jsdom; a implementação foi verificada com Node.js 22.17.1:

```sh
npm ci
npm test
```

`npm test` gera automaticamente os arquivos necessários antes dos testes. Para gerar somente os protótipos, execute `npm run build`.

O build grava os três HTMLs em **`dist/`**: `prototipo-normatic.html` contém a plataforma e o componente documental incorporado, `prototipo-documentos.html` é o componente auxiliar e `prototipo-farol.html` é o redirecionamento de compatibilidade. Para a versão modular, mantenha `index.html`, `normativos.html`, `assets`, `css` e `js` juntos. Prefira servir via HTTP, inclusive para os protótipos.

## Organização da pasta

- Raiz: entradas HTML atuais, configurações e este guia.
- `assets/`, `css/`, `js/`: recursos e código em uso.
- `tools/`, `tests/`, `docs/`: ferramentas, testes e documentação.
- `dist/`: HTMLs gerados, recriados pelo build.
- `arquivo/`: referências e entregas antigas preservadas.
- `node_modules/`: dependências locais dos testes, recriadas com `npm ci`.

`tools/empacotar.ps1` gera o ZIP atual em `dist/entregas/`, com o código, testes e ferramentas. O pacote não acumula backups, dependências instaladas ou outros ZIPs. Os protótipos podem ser recriados com o build após extrair o pacote. Os dados cadastrados continuam no navegador; não foram movidos por essa organização.

As treze suítes verificam permissões, transações, auditoria e integração Supabase em PostgreSQL local, além de regras, persistência, CRUD, filtros, agenda, unidades, atas, exportações, recursos, navegação unificada, preservação de rascunhos, login, MFA, e-mails e segurança. Há testes de CSS para 390, 768, 1024 e 1440 px, mas eles não substituem inspeção visual em navegador real. Veja [a organização e a validação da plataforma](docs/PLATAFORMA-UNIFICADA.md).
