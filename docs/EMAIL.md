# Lembretes por e-mail: tarefas e reuniões

O envio é feito no servidor da Vercel usando Resend e os registros do Supabase. Não depende de alguém deixar a aplicação aberta. **Permanece desligado até configurar as variáveis e aplicar a terceira migração.** Nenhum e-mail real foi enviado durante a implementação.

## Regras desta etapa

- Um resumo por destinatário por dia, com tarefas que vencem hoje/amanhã e reuniões de hoje/amanhã. Horário programado: 7h de Rio Branco (12h UTC). No plano Hobby da Vercel, a execução pode ocorrer dentro daquela hora, sem precisão de minuto.
- Tarefas: somente quando o responsável está cadastrado com e-mail válido/ativo, o prazo está preenchido, a tarefa está aberta e a opção **Receber lembretes por e-mail** é **Sim**. O campo antigo `enviar_convite` foi reaproveitado, preservando as escolhas existentes. Registros sem essa preferência não enviam.
- Reuniões: membros e convidados recebem lembretes quando seus nomes correspondem a um responsável com e-mail válido/ativo. O sufixo de setor, como `(STI)`, é desconsiderado na busca. Nomes ambíguos com e-mails diferentes não recebem. Mantenha os cadastros consistentes. Reuniões canceladas ou cujo horário de hoje já passou são ignoradas.
- Não envia avisos de normativos, projetos ou compromissos, nem convites de calendário, avisos imediatos de criação/alteração ou notificações diárias de atraso. O texto da pauta/título é enviado ao destinatário correspondente, sem cópia para outros participantes.
- O resumo é montado na hora da execução. Edições após o envio aparecem na aplicação, mas não geram novo resumo naquele dia. Consulte o sistema para obter os dados atualizados.

## 1. Criar o serviço de envio

Crie uma conta em https://resend.com usando o e-mail no qual deseja testar. Sem domínio próprio, o remetente de teste é `Normatic <onboarding@resend.dev>` e só pode enviar ao e-mail da sua conta Resend. Não é possível usar livremente um remetente `@gmail.com` no Resend.

Crie uma API Key com permissão de envio no painel do Resend. Coloque-a diretamente na configuração da Vercel, sem enviar por mensagem ou salvar no código.

Para enviar à equipe depois, cadastre e verifique um domínio de sua propriedade no Resend, seguindo os registros DNS solicitados. O domínio do site `*.vercel.app` não concede controle DNS para verificar o remetente. O domínio de envio pode ser diferente do domínio de hospedagem do site.

## 2. Preparar o banco

No SQL Editor do Supabase execute **apenas** `supabase/migrations/202611130003_email.sql`, uma vez. Ela cria o histórico de envios e funções exclusivas do servidor. Não repita as migrações anteriores.

Em **Project Settings → API Keys**, localize a chave legada `service_role` do seu projeto. Ela é necessária somente na Vercel para o processo automático ler os registros e controlar os envios. Não coloque essa chave em `js/cloud/config.js`, no Git, no navegador ou em mensagens. A chave pública já existente continua sendo a única usada pela interface.

## 3. Variáveis na Vercel

Abra **Settings → Environment Variables** do projeto e configure para **Production**:

| Variável | Valor |
| --- | --- |
| `EMAIL_ENABLED` | `false` durante a configuração; `true` somente quando estiver pronto para enviar |
| `SUPABASE_URL` | `https://ncrakpzkiktdfawisacy.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | A chave legada `service_role`, inserida diretamente no painel |
| `RESEND_API_KEY` | A API Key de envio criada no Resend |
| `EMAIL_FROM` | No teste: `Normatic <onboarding@resend.dev>` |
| `EMAIL_TEST_TO` | O e-mail da sua conta Resend |
| `CRON_SECRET` | Um segredo aleatório longo (pelo menos 32 caracteres), criado e guardado no painel |
| `APP_URL` | Opcional: o endereço HTTPS publicado do sistema |

Não use prefixos públicos nas variáveis. Após salvar, faça um **Redeploy** para a função receber os valores. O build estático não incorpora essas variáveis ao JavaScript do navegador.

`EMAIL_TEST_TO` é uma lista de permissão com um único endereço: destinatários diferentes são ignorados, nunca redirecionados para você. Para testar, cadastre seu nome/e-mail em Responsáveis e uma tarefa aberta com lembrete **Sim** e prazo hoje/amanhã, ou inclua seu nome nos participantes de uma reunião hoje/amanhã. Coloque `EMAIL_ENABLED=true` e faça o redeploy quando estiver pronto.

## 4. Validar o envio

O agendamento está em `vercel.json` e roda somente em produção. No painel da Vercel, abra **Settings → Cron Jobs** e execute o job `email-reminders` para testar ou aguarde o horário diário. A rota exige `Authorization: Bearer <CRON_SECRET>`; abrir o endereço diretamente no navegador deve retornar 401.

Veja o resultado nos logs da função e no painel de e-mails do Resend. `accepted` significa aceito pelo provedor, não confirma entrega na caixa de entrada. Confirme o recebimento e confira spam. O Supabase guarda o histórico em `normatic_email_deliveries`; consulte pelo SQL Editor, pois ele não fica disponível à interface.

Quando o domínio estiver verificado, altere `EMAIL_FROM` para um remetente daquele domínio, remova `EMAIL_TEST_TO` e faça novo deploy. Isso libera os destinatários cadastrados. Para interromper todos os envios, defina `EMAIL_ENABLED=false` e faça redeploy.

## Falhas e limites

O histórico impede novo envio de resumos já aceitos. Reservas de dois minutos evitam execuções concorrentes e o corpo original é preservado nas tentativas. O Resend recebe uma chave de idempotência estável por data/destinatário. Há até três tentativas, dentro de 20 horas da primeira; isso fica dentro da validade de 24 horas da idempotência do provedor.

O cron diário não faz retentativas automáticas naquela mesma manhã. Se houver erro ou destinatários adiados pelo tempo máximo da função, execute novamente o job no painel após pelo menos dois minutos, ainda no mesmo dia e dentro da janela de 20 horas. Não apague o histórico para forçar reenvio: pode duplicar mensagens. A função limita cada rodada a aproximadamente 40 segundos de processamento e retorna 503 em falhas/adiamentos. Grandes equipes exigem fila e agendamento mais frequente em uma etapa posterior.

Falhas de configuração e dados pessoais não são expostos na resposta pública. O histórico contém destinatário e corpo; é exclusivo do servidor/administrador, com RLS e sem permissão para usuários comuns. Não muda as regras de MFA do aplicativo: apenas o processo automático usa a credencial de servidor. Não há confirmação de entrega/bounce via webhook nesta etapa.

## Testes e referências

`node tests/email.test.cjs` testa a seleção de destinatários, opt-out, datas de Rio Branco, cancelamentos, nomes ambíguos, rota protegida, falhas do provedor e histórico transacional em PostgreSQL local. Chamadas ao Resend são simuladas; não houve envio real nem configuração remota automática.

- https://resend.com/docs/knowledge-base/403-error-resend-dev-domain
- https://resend.com/docs/dashboard/domains/introduction
- https://resend.com/changelog/idempotency-keys
- https://vercel.com/docs/cron-jobs/manage-cron-jobs
- https://vercel.com/docs/cron-jobs/usage-and-pricing
