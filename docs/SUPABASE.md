# Ativar o Supabase

A integração está ativada para o projeto `ncrakpzkiktdfawisacy`, com dados compartilhados pela equipe (`enabled: true`). A aplicação exige login e utiliza o Supabase. A opção escolhida é começar com o banco vazio, sem importar dados locais. Os passos abaixo também documentam a preparação de uma nova instalação.

## Preparar o banco e os usuários

1. No painel do seu projeto Supabase, abra **SQL Editor**. Execute uma única vez, em ordem, o conteúdo das migrações:
   - [202611130001_equipe.sql](../supabase/migrations/202611130001_equipe.sql) — tabelas, RLS e RPCs base.
   - [202611130002_mfa.sql](../supabase/migrations/202611130002_mfa.sql) — verificação MFA em duas etapas.
   - [202611130003_email.sql](../supabase/migrations/202611130003_email.sql) — suporte a lembretes por e-mail.
   - [202611170004_gravacao_incremental.sql](../supabase/migrations/202611170004_gravacao_incremental.sql) — gravação por coleção individual.
   - [202611170005_auditoria.sql](../supabase/migrations/202611170005_auditoria.sql) — trilha de auditoria de acessos e alterações.
2. Em **Authentication → Users**, crie seu usuário com e-mail e senha. Digite a senha apenas no Supabase e na tela de login da aplicação; não a envie por mensagem.
3. Abra [02_primeiro_acesso.sql](../supabase/02_primeiro_acesso.sql), substitua `SEU_EMAIL_AQUI` pelo e-mail desse usuário e execute no SQL Editor. Isso autoriza seu acesso como administrador.
4. Em [js/cloud/config.js](../js/cloud/config.js), altere apenas `enabled: false` para `enabled: true`. A URL e a chave pública fornecidas já estão configuradas.
5. Execute `npm start`, acesse `http://localhost:4173` e faça login. Se usar os HTMLs gerados, execute `npm run build` novamente após alterar a configuração.

Para cada colega, crie o usuário em Authentication e utilize o exemplo comentado ao final de `02_primeiro_acesso.sql` para autorizar `editor` ou `viewer`. Cadastro público não concede acesso aos dados. Administrador e editor podem gravar; viewer pode consultar. A administração de membros é feita pelo SQL, sem tela administrativa nesta etapa.

## Trazer os dados existentes

Use o mesmo navegador, perfil e endereço que já acessavam os registros locais. Após o login, clique em **Baixar backup local**, guarde o JSON e então em **Importar dados locais**. A importação exige que todas as coleções do banco estejam vazias e solicita confirmação. Faça a importação em um único computador que contenha os dados completos.

Os documentos, unidades, reuniões, atas, projetos, responsáveis, tarefas e compromissos são enviados numa transação, preservando campos, IDs e ordem. Se houver erro, a transação inteira é desfeita. Os dados locais não são apagados nem substituídos. A ferramenta não mescla cadastros de computadores diferentes nem importa dados externos automaticamente.

## Uso pela equipe

Todos os membros ativos autorizados enxergam os mesmos registros. Use **Atualizar dados** para buscar alterações realizadas por colegas. Não há atualização em tempo real nesta etapa. Se outra pessoa gravar após sua última leitura, o sistema recusa a gravação desatualizada; atualize os dados e refaça a alteração. Falhas na nuvem não gravam silenciosamente no armazenamento local.

Desativar a integração volta a exibir os registros locais anteriores, que podem estar desatualizados. Isso não baixa nem restaura dados da nuvem. O backup local disponível na barra também representa o navegador, e não um backup do banco Supabase.

## Estrutura e proteção

São oito tabelas de registros com os campos originais em JSONB, posição e metadados de alteração. Essa estrutura preserva o código e os campos existentes; as tarefas têm vínculo de projeto validado no banco. A revisão compartilhada impede sobrescritas concorrentes. A gravação incremental (`normatic_commit_collection`) permite salvar uma coleção individual sem enviar todas as oito. O controle atual abrange o conjunto completo de dados, sem paginação no servidor; grandes volumes poderão exigir evolução posterior.

A tabela `normatic_audit_events` registra automaticamente criações, edições e exclusões em qualquer coleção. Atualizações que alteram somente posição (reordenação) sem modificar o conteúdo não geram evento de auditoria. Acessos ao sistema são registrados com limite de 30 minutos entre entradas consecutivas. Apenas administradores podem consultar a trilha via `normatic_audit_log`.

As tabelas possuem RLS. Usuários anônimos, não autorizados ou desativados não têm acesso aos dados. Gravações passam por funções transacionais que verificam o papel do usuário; não há escrita direta pelo cliente nem autorização de membros pelo próprio usuário. IDs antigos devem usar letras, números, espaços, ponto, hífen, sublinhado ou dois-pontos, com até 100 caracteres e primeiro caractere alfanumérico. Uma incompatibilidade é recusada sem apagar os originais.

A chave publishable é pública por definição e pode estar no código do navegador. Senha do banco e chaves secretas/service_role não devem entrar no front-end ou no Git. Referências oficiais: [chaves de API](https://supabase.com/docs/guides/getting-started/api-keys) e [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

Não foram adicionados e-mails automáticos, Google Agenda ou hospedagem. A opção de convite continua sem envio. O SDK oficial é distribuído localmente em `js/vendor/`, junto da licença, para evitar dependência de CDN durante a inicialização.

## Validação

`npm test` executa as suítes existentes e as seis suítes de nuvem. `npm run test:cloud` verifica isoladamente RLS, permissões, importação, transações, relacionamentos, conflitos, login, integração das telas, MFA e e-mails. As operações SQL são executadas em PostgreSQL local com PGlite; as chamadas do cliente Supabase são simuladas nesses testes. `npm run check:supabase` consulta somente a configuração pública de autenticação do projeto, sem ler ou alterar cadastros.

O endpoint público respondeu HTTP 200 com login por e-mail habilitado. A migração ainda não foi executada no projeto remoto e nenhum login real foi validado. Após os passos acima, valide no seu navegador a importação, uma edição, as consultas e o acesso de um segundo usuário. Os testes de DOM/CSS não substituem revisão visual em navegador real.
