# Normatic + FAROL — etapa 1

Dois módulos estáticos, na mesma origem, com navegação independente e identidade visual compartilhada.

- **Normatic (`index.html`):** cadastro, pesquisa, edição, exclusão, vigências, regularização, histórico e relatórios de normativos. Os tipos documentais e registros sem normativo existentes foram preservados; não representam um segundo gerenciador de projetos.
- **FAROL (`farol.html`):** projetos, tarefas, responsáveis, prioridades, status, compromissos, reuniões, pautas, unidades e atas. A agenda mostra compromissos, prazos de projetos/tarefas e reuniões diretamente dos cadastros, sem copiar reuniões para compromissos.

O botão **FAROL**, no menu lateral do Normatic, abre o módulo na mesma aba. **Voltar ao Normatic** faz o caminho inverso. Favoritos antigos `#reunioes` e `#minutas` do Normatic são encaminhados ao FAROL.

## Executar

Com Node.js instalado, abra um terminal na pasta do projeto:

```sh
npm start
```

Acesse **http://localhost:4173**. Não é necessário instalar dependências para usar a aplicação ou gerar os HTMLs com recursos embutidos. O servidor local usa apenas recursos nativos do Node.js. Para outra porta, configure a variável `PORT`.

Também é possível servir esta pasta com outro servidor estático. Mantenha os dois HTMLs, `assets`, `css` e `js` na mesma origem. Abrir arquivos diretamente via `file://` depende de como cada navegador trata o armazenamento; prefira HTTP.

## Dados existentes

| Dados | Armazenamento |
| --- | --- |
| Normativos | `igov:documentos` no localStorage; mantém suporte ao adaptador `window.storage` existente |
| Reuniões e pautas | `igov:reunioes`, a mesma chave anterior |
| Atas | `igov:minutas`, a mesma chave anterior e o limite anterior de 50 registros |
| Unidades de reuniões | `igov:unidades-reuniao`, a mesma chave anterior |
| Projetos, tarefas, responsáveis e compromissos FAROL | `farol:dados:v1`, adaptador local separado |

Não houve migração para serviços ou exclusão de dados do navegador. Reuniões e atas existentes ficam disponíveis no FAROL quando aberto **no mesmo navegador, perfil e origem** usados anteriormente. Mudar protocolo, host ou porta muda o armazenamento acessível; isso não apaga os dados no endereço anterior.

O ZIP fornecido do FAROL contém interface e preparação para backend, mas não contém os registros da planilha ou banco anterior. Essa cópia exigia Supabase e login para inicializar. Nesta etapa ela utiliza armazenamento local, começa vazia e não consulta nem importa automaticamente dados de contas externas. Nenhum dado de exemplo é inserido pela aplicação.

## Recursos reaproveitados

As telas de reuniões, pautas, unidades, membros, convidados, remarcação, cancelamento, filtros, relatórios e atas foram transferidas do Normatic para o FAROL. O código permanece em `js/reunioes` e `js/minutas`, usado somente pelo FAROL. O calendário específico de reuniões mantém seus filtros; a Agenda FAROL oferece a visão integrada de todas as atividades. A pauta continua sendo um campo da reunião.

O FAROL reaproveita sua interface original e seus cadastros, inclusive compromissos em várias datas. O contrato `FarolStorage.api()` separa a persistência da interface, permitindo substituir esse adaptador futuramente. Renomear um responsável atualiza seus vínculos; projetos com tarefas e responsáveis vinculados não são excluídos sem antes resolver os vínculos. Responsáveis inativos continuam selecionados nos registros que já lhes pertencem.

Os tokens de cores, tipografia, espaçamentos, formulários e navegação compartilhados ficam em `css/base.css`, `css/tipografia.css` e `css/plataforma.css`. A estrutura visual do FAROL foi reaproveitada em `css/farol-original.css` e adaptada pela folha compartilhada.

## Verificações

Os testes foram executados com Node.js 22.17.1. Para instalá-los e rodá-los:

```sh
npm ci
npm test
```

Há testes das regras existentes, persistência FAROL e integração de DOM com formulários reais, incluindo CRUD, filtros, vínculos, lotes, reuniões, pautas, atas e geração de DOCX/PDF. Os dados de teste são isolados. Veja [a verificação detalhada](docs/VERIFICACAO-ETAPA1.md).

A revisão de layout remove a seção Sobre do Normatic, compartilha componentes e calendários e corrige os menus de atas e a responsividade. Veja [as causas, correções e limites dos testes visuais](docs/CORRECOES-LAYOUT.md).

## HTMLs com recursos embutidos

```sh
npm run build
```

Gera `prototipo-normatic.html` e `prototipo-farol.html`, cada um com seus recursos incorporados. Mantenha **os dois juntos** para navegar entre os módulos. A versão modular (`index.html` e `farol.html`) continua sendo a fonte para edição.

## Escopo e próxima etapa

Não foram implementados Supabase, autenticação definitiva, envio automático de e-mail, Google Agenda ou hospedagem. O campo de preferência de convite do FAROL é preservado, mas não envia convites nesta etapa. As ações manuais preexistentes do Normatic continuam disponíveis.

A geração e edição manual de atas, com exportação Word/PDF, funciona localmente. O ponto de integração de IA preexistente foi preservado, mas fica indisponível sem serviço configurado; falhas não geram conteúdo simulado. Nenhum novo serviço de IA foi criado ou conectado.

O documento [de análise e decisões](docs/INTEGRACAO-ETAPA1.md) registra a separação dos domínios. O pacote FAROL recebido e cópias de referência do Normatic estão em `referencias/`; seus READMEs e scripts de Supabase são material de referência e não são executados pela plataforma nem pelo build. Não siga seus passos de migração para executar esta etapa.
