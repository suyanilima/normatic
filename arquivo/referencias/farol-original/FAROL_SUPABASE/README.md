# FAROL — Preparação da migração para Supabase

## O que está incluído
- `index.html`: interface atual com adaptador Supabase, login por link enviado ao e-mail e atualização por Realtime.
- `config.js`: configuração pública do frontend (NUNCA coloque service_role aqui).
- `sql/01_schema.sql`: quatro tabelas, RLS e lista de e-mails autorizados.
- `supabase/functions/google-sync/index.ts`: função protegida para criar, editar e remover eventos no Google Agenda.
- `tools/exportar_planilha.gs`: exportação dos dados existentes em JSON.
- `tools/importar.mjs`: importação dos JSONs para o Supabase.

## Passos no notebook
1. **Faça backup** da planilha e do projeto Apps Script original. Não desligue o sistema antigo antes de validar o novo.
2. Crie um projeto no Supabase. Em SQL Editor execute `sql/01_schema.sql`.
3. Execute no SQL Editor `insert into public.usuarios_autorizados(email) values ('SEU_EMAIL') on conflict do nothing;` e inclua os e-mails de cada integrante. **Não habilite cadastro público irrestrito**; a lista RLS controla acesso aos dados.
4. Em Authentication > Providers habilite e-mail OTP / magic link. Configure Site URL e Redirect URLs para o domínio que hospedará o FAROL. Configure limites/SMTP para uso institucional.
5. Em Database > Publications > `supabase_realtime`, habilite `projetos`, `tarefas`, `responsaveis`, `agenda` (caso não estejam habilitadas).
6. Em Project Settings > API, copie a **Project URL** e a chave **publishable/anon** para `config.js`. Nunca coloque `service_role` no site.
7. Hospede `index.html` e `config.js` em um host estático HTTPS (ex.: Vercel). Faça login e teste criação/edição/exclusão em duas abas.
8. Para importar os dados antigos, cole `tools/exportar_planilha.gs` no Apps Script antigo e execute `exportarFarolJSON`. Baixe do Drive os quatro arquivos `FAROL_*.json` para a pasta em que executará o importador. Use Node.js e execute `node tools/importar.mjs` com variáveis `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` configuradas **somente no terminal local**. Não suba os JSONs nem a chave service_role para GitHub/Vercel.
9. **Integração Google Agenda (opcional até configurar):** habilite Google Calendar API no Google Cloud, crie credenciais OAuth 2.0 e obtenha autorização offline da conta que será organizadora dos eventos, com escopo `https://www.googleapis.com/auth/calendar.events`. Configure os segredos `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` e `GOOGLE_CALENDAR_ID` na Edge Function. Publique com `supabase functions deploy google-sync` mantendo a verificação de JWT habilitada. A função usa o token do usuário para confirmar a identidade e uma lista de e-mails autorizados. **Não cole credenciais em arquivos públicos.**
10. **Planilha como espelho:** a sincronização automática de volta ao Sheets ainda exige uma integração separada (Google Sheets API, OAuth e fila/retry). **Não está implementada neste pacote**. Não considere a planilha sincronizada após a migração até essa etapa estar configurada e testada.

## Atenção antes de usar com dados reais
- Este é um **pacote inicial para homologação**, não uma implantação já testada em produção. Não foi executado contra sua conta Supabase/Google nem testado com usuários reais.
- O RLS atual concede leitura/escrita a **todos os e-mails autorizados**. Se precisarem de papéis diferentes (supervisora, editor, leitor), ajuste as políticas antes da produção.
- A função Google sincroniza eventos somente se `enviar_convite=Sim` e usa uma conta Google organizadora. Sem configuração OAuth, os dados são salvos no Supabase, mas os convites não são enviados.
- A integração Google não é transacional com o banco; é preciso implementar uma fila de retentativas para robustez em produção.
- O Google Calendar usa horário fixo `-05:00` para o Acre. Eventos de tarefas usam 09:00–10:00; compromissos preservam início e fim.
- Não migre dados institucionais reais sem autorização da área de TI/segurança do órgão e validação de LGPD, acesso e retenção.
- Se sua organização restringe Supabase ou serviços externos, obtenha aprovação antes de hospedar dados institucionais.
