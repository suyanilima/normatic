# Autenticação em duas etapas

O login exige senha e um código TOTP de 6 dígitos do aplicativo autenticador. No primeiro acesso, a aplicação apresenta o QR code e a chave de cadastro manual. A conta só abre a plataforma após confirmar um código válido. Nas próximas entradas com senha, pede o código novamente. Uma sessão já verificada (AAL2) não pede novo código a cada atualização de página.

## Ativar no projeto existente

1. Publique o código atualizado na Vercel e aguarde a conclusão do deploy.
2. No SQL Editor do Supabase, execute **somente** `supabase/migrations/202611130002_mfa.sql`. Não execute novamente a primeira migração. A nova migração não altera nem apaga os registros.
3. Saia e entre novamente no endereço publicado. Cadastre o QR code no seu aplicativo autenticador e confirme o código. Cada membro cadastra seu próprio autenticador.
4. Teste outro login em janela anônima: após a senha, deve pedir o código do aplicativo.

Para instalações novas, aplique as duas migrações na ordem dos nomes. O cadastro e a verificação TOTP devem estar habilitados nas configurações de MFA do Supabase Auth. Não são necessárias novas variáveis na Vercel.

O código novo bloqueia o acesso à interface antes da segunda etapa, mas a exigência no banco só entra em vigor ao executar a segunda migração. Ela modifica `normatic_role()`, usada pelas políticas RLS e pelas funções transacionais: mesmo chamadas diretas à API não conseguem ler ou gravar os dados sem um token Supabase AAL2. Mantenha a mesma restrição em futuras funções que acessem os dados.

## Troca ou perda do dispositivo

Guarde o acesso ao aplicativo autenticador conforme os recursos de backup dele. Não compartilhe o QR code, a chave ou os códigos de uso temporário. O Normatic não gera códigos de recuperação nesta versão e não oferece desativação de MFA pela interface.

Se perder o autenticador, o administrador do projeto deve confirmar sua identidade e remover o fator da sua conta em Authentication → Users no painel do Supabase. O próximo login exigirá um novo cadastro; a exigência de duas etapas no banco permanece ativa. Não exclua a conta ou os dados para recuperar o acesso.

Fatores TOTP não confirmados de tentativas anteriores são removidos ao reiniciar um cadastro. Fatores confirmados são preservados; quando houver mais de um, a tela permite escolher qual usar. QR code e chave ficam apenas no formulário de cadastro, sem armazenamento adicional ou registros de log pela aplicação.

## Testes

`npm test` inclui testes de cadastro, verificação inválida, sessão já verificada, cancelamento e proteção AAL2 das consultas diretas e RPCs em PostgreSQL local. As APIs de autenticação são simuladas; a validação real do QR code exige seu aplicativo e sua conta. O SQL não pode ser aplicado remotamente com a chave pública do cliente.

Referência oficial: https://supabase.com/docs/guides/auth/auth-mfa/totp
