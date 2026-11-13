# Publicar na Vercel

O `vercel.json` configura o projeto como site estático e publica apenas `dist/site`. O comando `npm run build:site` copia as entradas HTML e os recursos `assets`, `css` e `js`, preservando os caminhos do componente documental. SQL, testes, documentação e backups ficam fora do site público.

1. Envie a versão atual para o repositório `suyanilima/normatic` no GitHub.
2. Na Vercel, entre com GitHub e escolha **Add New → Project**.
3. Importe o repositório `normatic`. Se ele não aparecer, permita o acesso da Vercel ao repositório no GitHub.
4. Mantenha a pasta raiz do projeto. O framework é **Other**, o Build Command é `npm run build:site` e o Output Directory é `dist/site`, definidos no arquivo de configuração. Não use `npm start` como comando de build.
5. Clique em **Deploy** e abra a URL HTTPS gerada.

Esta versão já contém a URL e a chave pública Supabase; não exige variáveis de ambiente na Vercel. Nunca configure chaves secretas no JavaScript. O banco permanece no Supabase, compartilhado com a instalação local.

No endereço publicado, faça login, consulte um registro já existente e crie/edite um registro. Atualize a página e confirme em outra sessão. Verifique Normativos (componente incorporado), reuniões, atas e exportações. A publicação não importa dados locais e não cria tabelas ou usuários.

O login atual usa e-mail e senha, sem links de redirecionamento. Quando houver recuperação de senha ou confirmação por e-mail, configure os endereços de autenticação do Supabase para o domínio publicado antes de implementar esses fluxos.

O build local não confirma uma implantação remota. A publicação exige uma sessão autorizada na Vercel. Referência: https://vercel.com/docs/project-configuration/vercel-json
