const SETORES_CONVIDADOS = Object.fromEntries([
  ['1ª ZE','1ª ZONA ELEITORAL'],['2ª ZE','2ª ZONA ELEITORAL'],['3ª ZE','3ª ZONA ELEITORAL'],
  ['4ª ZE','4ª ZONA ELEITORAL'],['5ª ZE','5ª ZONA ELEITORAL'],['6ª ZE','6ª ZONA ELEITORAL'],
  ['7ª ZE','7ª ZONA ELEITORAL'],['8ª ZE','8ª ZONA ELEITORAL'],['9ª ZE','9ª ZONA ELEITORAL'],
  ['AGECON','Agente de Contratação'],['AGEL','ASSESSORIA DE GESTÃO ELEITORAL'],
  ['ASCOM','ASSESSORIA DE COMUNICAÇÃO SOCIAL'],['ASCRE','ASSESSORIA DA CORREGEDORIA REGIONAL ELEITORAL'],
  ['ASGIM','ASSESSORIA DE GESTÃO DE IMÓVEIS'],
  ['ASGOVSAOF','Assessoria de Governança e Planejamento da Secretaria de Administração, Orçamento e Finanças - ASGOVSAOF'],
  ['ASJUIZ','ASSISTÊNCIA AOS JUÍZES-MEMBROS'],['ASJUR','ASSESSORIA JURÍDICA'],
  ['ASPGOVTI','ASSISTÊNCIA DE PLANEJAMENTO E GOVERNANÇA'],
  ['ASPLAN','ASSESSORIA DE PLANEJAMENTO, ESTRATÉGIA E GESTÃO'],['ASPRES','ASSESSORIA DA PRESIDÊNCIA'],
  ['ASSAI','ASSISTÊNCIA DE SUSTENTABILIDADE, ACESSIBILIDADE E INCLUSÃO - ASSAI'],
  ['CAE','SETOR DE PROTOCOLO DA CAE'],['CAVE','Comissão de Auditoria da Votação Eletrônica - CAVE'],
  ['CGE','COMITÊ GESTOR DA ESTRATÉGIA'],['CGLAIS','COMITÊ GESTOR LOCAL DE ATENÇÃO INTEGRAL À SAÚDE'],
  ['CGOVTIC','COMITÊ DE GOVERNANÇA DE TECNOLOGIA DA INFORMAÇÃO E COMUNICAÇÃO'],
  ['CGPDP','Comitê Gestor de Proteção de Dados Pessoais'],
  ['CGPLS','Comissão Gestora do Plano de Logística Sustentável'],['CGRP','COMITÊ GESTOR REGIONAL DO PJE'],
  ['CGRT','Comissão de Gestão do Regime de Teletrabalho'],
  ['CGTIC','COMITÊ GESTOR DE TECNOLOGIA DA INFORMAÇÃO E COMUNICAÇÃO'],
  ['CIE','COORDENADORIA DE INFRAESTRUTURA'],
  ['CIFBA','COMISSÃO DE INVENTÁRIO FÍSICO DOS BENS DE ALMOXARIFADO'],
  ['CIFBM','COMISSÃO DE INVENTÁRIO FÍSICO DOS BENS MÓVEIS'],
  ['CMJEAC','Comissão de Gestão da Memória da Justiça Eleitoral do Acre'],
  ['COAUDI','COORDENADORIA DE CONTROLE INTERNO E AUDITORIA'],['COCRE','COORDENADORIA DA CORREGEDORIA'],
  ['COELE','COORDENADORIA DE ELEIÇÕES'],['COFIN','COORDENADORIA DE ORÇAMENTO E FINANÇAS'],
  ['COGEP','COORDENADORIA DE GESTÃO DE PESSOAS'],['COMAP','COORDENADORIA DE MATERIAL E PATRIMÔNIO'],
  ['COSEG','COORDENADORIA DE SERVIÇOS GERAIS'],['COSES','COORDENADORIA DAS SESSÕES'],
  ['COSET','COMITÊ SETORIAL'],['CP','Comissão Processante'],
  ['CPEAD','Comissão de Prevenção e Enfrentamento do Assédio e da Discriminação'],
  ['CPEAMAS-1G','COMISSÃO DE PREVENÇÃO E ENFRENTAMENTO DO ASSÉDIO MORAL E DO ASSÉDIO SEXUAL'],
  ['CPES','COMISSÃO PERMANENTE DE ÉTICA E SINDICÂNCIA'],['CPFEM','Comissão de Participação Feminina'],
  ['CPL','COMISSÃO PERMANENTE DE LICITAÇÃO'],
  ['CPPG','COMITÊ GESTOR REGIONAL DE ATENÇÃO PRIORITÁRIA AO PRIMEIRO GRAU DE JURISDIÇÃO'],
  ['CPS','COMISSÃO PERMANENTE DE SEGURANÇA'],
  ['CRIP','COORDENADORIA DE REGISTROS E INFORMAÇÕES PROCESSUAIS'],
  ['CRPIR','COMITÊ REGIONAL DE PROMOÇÃO À IGUALDADE RACIAL'],
  ['CSCOR','Coordenadoria de Soluções Corporativas'],['CSI','Comissão de Segurança da Informação'],
  ['CTA','Comissão de Transporte e Alimentação'],['DBI','DESFAZIMENTO DE BENS INSERVÍVEIS'],
  ['EJE','ESCOLA JUDICIÁRIA ELEITORAL'],['EPSTI','ESCRITÓRIO DE PROJETOS DA STI'],
  ['GAAUX','GABINETE DA JUÍZA AUXILIAR'],['GACRE','GABINETE DA CORREGEDORIA REGIONAL ELEITORAL'],
  ['GADG','GABINETE DA DIRETORIA-GERAL'],['GAJAPRO','Gabinete dos Juízes Auxiliares da Propaganda'],
  ['GAJAUXCRE','Gabinete do Juiz Auxiliar da Corregedoria Regional Eleitoral'],
  ['GAJUD','GABINETE DA SECRETARIA JUDICIÁRIA'],['GAPRES','GABINETE DA PRESIDÊNCIA'],
  ['GASAOF','GABINETE DA SECRETARIA DE ADMINISTRAÇÃO, ORÇAMENTO E FINANÇAS'],
  ['GPINT','COMITÊ GESTOR DOS PORTAIS'],['GSTI','GABINETE DA SECRETARIA DE TECNOLOGIA DA INFORMAÇÃO'],
  ['GT - LGPD','Grupo de Trabalho - LGPD'],
  ['IN-NAUA','Laboratório de Inovação e Objetivos de Desenvolvimento Sustentável do Tribunal Regional Eleitoral do Acre (IN-NAUÁ)'],
  ['LGBTQIA+','Comissão Especial voltada à promoção dos direitos das pessoas LGBTQIA+'],
  ['MPE','MINISTÉRIO PÚBLICO ELEITORAL - MPE'],
  ['NISIPJ','NÚCLEO DE INTELIGÊNCIA DE SEGURANÇA INSTITUCIONAL E POLÍCIA JUDICIAL'],
  ['NREG','Núcleo Regional Eleitoral das Garantias'],['NULAB','Núcleo Laboratório de Inovação e Gestão da Qualidade'],
  ['OUVIDORIA','OUVIDORIA ELEITORAL'],['OUVIMULHER','Ouvidoria da Mulher'],
  ['PAD','PROCESSO ADMINISTRATIVO DISCIPLINAR'],['PROTO','SEÇÃO DE PROTOCOLO'],
  ['SAREMI','Seção de Apoio aos Inativos e Cadastro de Magistrados - SAREMI'],
  ['SASBEN','SEÇÃO DE ASSISTÊNCIA À SAÚDE E BENEFÍCIOS'],
  ['SCPE','SEÇÃO DE CADASTRO ELEITORAL E PROCESSOS ESPECÍFICOS'],['SCSEG','Seção de Cibersegurança'],
  ['SDBD','SEÇÃO DE DESENVOLVIMENTO E BANCO DE DADOS'],['SDP','SEÇÃO DE DIREITOS POLÍTICOS'],
  ['SEADE','SEÇÃO DE ADMINISTRAÇÃO DO EDIFÍCIO'],['SEANT','SEÇÃO DE ATAS E NOTAS TAQUIGRÁFICAS'],
  ['SEAPTIC','SEÇÃO DE AUDITORIA DE GESTÃO DE PESSOA E TECNOLOGIA DA INFORMAÇÃO E COMUNICAÇÃO'],
  ['SECAP','SEÇÃO DE CONTROLE E ACOMPANHAMENTO DE PROCESSOS'],
  ['SECARF','SEÇÃO DE CADASTRO E REGISTROS FUNCIONAIS'],
  ['SECEP','SEÇÃO DE EXAME DE CONTAS ELEITORAIS E PARTIDÁRIAS'],['SECON','SEÇÃO DE CONTABILIDADE'],
  ['SEDES','SEÇÃO DE CAPACITAÇÃO E DESENVOLVIMENTO'],
  ['SEGLOF','SEÇÃO DE AUDITORIA DE GESTÃO DE LOGÍSTICA, ORÇAMENTO E FINANÇAS'],
  ['SEMAP','SEÇÃO DE MATERIAL E PATRIMÔNIO'],['SEPAG','SEÇÃO DE PAGAMENTOS'],
  ['SEREDE','SEÇÃO DE REDES'],['SESEL','SEÇÃO DE SISTEMAS ELEITORAIS'],['SETRAN','SEÇÃO DE TRANSPORTES'],
  ['SEUE','SEÇÃO DE URNAS ELETRÔNICAS'],
  ['SGEC','Seção de Gestão de Contratos - SGEC, subordinada à Coordenadoria de Material e Patrimônio'],
  ['SJIP','SEÇÃO DE JURISPRUDÊNCIA, INDEXAÇÃO E GERENCIAMENTO DE DADOS PARTIDÁRIOS'],
  ['SLC','SEÇÃO DE COMPRAS, LICITAÇÕES E CONTRATOS'],
  ['SLDAG','SEÇÃO DE LEGISLAÇÃO, DOCUMENTAÇÃO E ARQUIVO GERAL'],['SOC','SEÇÃO DE ORIENTAÇÃO E CORREIÇÃO'],
  ['SPEF','SEÇÃO DE PROGRAMAÇÃO E EXECUÇÃO FINANCEIRA'],
  ['SPEO','SEÇÃO DE PROGRAMAÇÃO E EXECUÇÃO ORÇAMENTÁRIA'],
  ['SRDP','SEÇÃO DE REVISÃO DA AUTUAÇÃO E DA DISTRIBUIÇÃO DE PROCESSOS'],
  ['SRJAR','SEÇÃO DE REGISTROS DE JULGAMENTOS, ACÓRDÃOS E RESOLUÇÕES'],
  ['SSEC','Seção de Sistemas Eleitorais e Corporativos'],['SSU','SEÇÃO DE SUPORTE AO USUÁRIO'],
  ['VICRE','Vice-Presidência e Corregedoria Regional Eleitoral'],
  ['Z-ARQUIVO-9ZE','UNIDADE DE ARQUIVO DA 9ª ZONA ELEITORAL'],
  ['Z-ARQUIVO-AGEL','SEÇÃO DE ARQUIVOS DA AGEL'],['Z-ARQUIVO-ASPLAN','UNIDADE DE ARQUIVO DA ASPLAN'],
  ['Z-ARQUIVO-COAUDI','UNIDADE DE ARQUIVO DA COAUDI'],['Z-ARQUIVO-COCRE','UNIDADE DE ARQUIVO DA COCRE'],
  ['Z-ARQUIVO-COGEP','UNIDADE DE ARQUIVO DA COGEP'],['Z-ARQUIVO-CPES','ARQUIVO DA UNIDADE CPES'],
  ['Z-ARQUIVO-EJE','UNIDADE DE ARQUIVO DA EJE'],['Z-ARQUIVO-GADG','UNIDADE DE ARQUIVOS DA DIRETORIA-GERAL'],
  ['Z-ARQUIVO-GAJUD','UNIDADE DE ARQUIVO DA GAJUD'],['Z-ARQUIVO-GAPRES','UNIDADE DE ARQUIVO DA GAPRES'],
  ['Z-ARQUIVO-GASAO','ARQUIVOS GASAO'],['Z-ARQUIVO-GERAL','ARQUIVO-GERAL'],
  ['Z-ARQUIVO-SDBD','UNIDADE DE ARQUIVO DA SDBD'],['Z-ARQUIVO-SEADE','UNIDADE DE ARQUIVO DA SEADE'],
  ['Z-ARQUIVO-SEGLOF','UNIDADE DE ARQUIVOS DA SEGLOF'],['Z-ARQUIVO-SETRAN','SEÇÃO DE ARQUIVO DA SETRAN'],
  ['Z-ARQUIVO-SOC','UNIDADE DE ARQUIVO DA SOC'],['Z-ARQUIVO-STI','ARQUIVO-STI'],
  ['STI','Secretaria de Tecnologia da Informação'],
  ['GPTI','Assistência de Planejamento e Governança de Tecnologia da Informação']
]);

const ORDEM_GRUPOS_SETORES = [
  'Tecnologia da Informação (STI)',
  'Gabinetes e Direção',
  'Assessorias e Assistências',
  'Coordenadorias',
  'Seções e Núcleos',
  'Comitês, Comissões e Grupos',
  'Zonas Eleitorais',
  'Arquivos e Outros'
];

const SETORES_TI_SIGLAS = new Set([
  'STI', 'GSTI', 'ASPGOVTI', 'GPTI', 'EPSTI', 'CIE', 'CSCOR',
  'SDBD', 'SEREDE', 'SESEL', 'SSEC', 'SCSEG', 'SSU', 'SEUE',
  'CGTIC', 'CGOVTIC', 'CSI'
]);

const SIGLAS_MANTER_MAIUSCULAS = new Set([
  'TRE-AC', 'TIC', 'TI', 'STI', 'PJE', 'LGPD', 'MPE', 'CAE', 'CAVE', 'ASSAI',
  'ASGOVSAOF', 'SAREMI', 'SGEC', 'CPES', 'SEGLOF', 'SDBD', 'SEADE', 'SETRAN',
  'SOC', 'AGEL', 'ASPLAN', 'COAUDI', 'COCRE', 'COGEP', 'EJE', 'GADG', 'GAJUD',
  'GAPRES', 'GASAO', 'IN-NAUÁ', 'LGBTQIA+', 'DG', 'SEREDE', 'SEMAP'
]);

const PREPOSICOES_MINUSCULAS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'e', 'a', 'à', 'ao', 'aos', 'às', 'em', 'para', 'por', 'com', 'no', 'na', 'nos', 'nas'
]);

function formatarNomeSetorLegivel(nome){
  const texto = String(nome || '').trim();
  if(!texto) return '';
  if(texto !== texto.toUpperCase()) return texto;
  return texto.split(/(\s+|-)/).map((parte, indice) => {
    if(!parte || /^\s+$/.test(parte) || parte === '-') return parte;
    const limpa = parte.replace(/^[([{"']+|[)\]}"',.;:]+$/g, '');
    if(SIGLAS_MANTER_MAIUSCULAS.has(limpa)) return parte;
    const lower = parte.toLocaleLowerCase('pt-BR');
    if(indice > 0 && PREPOSICOES_MINUSCULAS.has(lower)) return lower;
    return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
  }).join('');
}

function classificarGrupoSetor(sigla){
  const s = String(sigla || '').trim().toUpperCase();
  if(!s) return 'Arquivos e Outros';
  if(SETORES_TI_SIGLAS.has(s) || /(^|[\s/])STI([\s/]|$)/.test(s)) return 'Tecnologia da Informação (STI)';
  if(s.endsWith('ZE')) return 'Zonas Eleitorais';
  if(s.startsWith('Z-ARQUIVO') || s === 'DBI' || s === 'PAD') return 'Arquivos e Outros';
  if(s.startsWith('GA') || s === 'VICRE' || s === 'OUVIDORIA' || s === 'OUVIMULHER' || s === 'EJE' || s === 'MPE') return 'Gabinetes e Direção';
  if(s.startsWith('AS') || s === 'AGEL' || s === 'AGECON') return 'Assessorias e Assistências';
  if((s.startsWith('CO') && s !== 'COSET') || s === 'CRIP') return 'Coordenadorias';
  if(
    s === 'COSET' || s === 'GPINT' || s === 'LGBTQIA+' || s.startsWith('GT') ||
    s.startsWith('CG') || s.startsWith('CI') || s.startsWith('CM') || s.startsWith('CP') ||
    s.startsWith('CR') || s.startsWith('CT') || s === 'CAVE'
  ) return 'Comitês, Comissões e Grupos';
  return 'Seções e Núcleos';
}

function formatarRotuloSetor(sigla){
  const s = String(sigla || '').trim();
  if(!s) return '';
  const nomeBruto = SETORES_CONVIDADOS[s];
  if(!nomeBruto) return s;
  const nome = formatarNomeSetorLegivel(nomeBruto);
  return `${s} — ${nome}`;
}

function obterGruposSetores(extras = []){
  const mapa = new Map();
  ORDEM_GRUPOS_SETORES.forEach(g => mapa.set(g, []));
  const adicionados = new Set();

  const inserir = (sigla, nomeBruto) => {
    const s = String(sigla || '').trim();
    if(!s || adicionados.has(s)) return;
    adicionados.add(s);
    const nome = nomeBruto ? formatarNomeSetorLegivel(nomeBruto) : '';
    const rotulo = nome ? `${s} — ${nome}` : s;
    const grupo = classificarGrupoSetor(s);
    mapa.get(grupo).push({ sigla: s, nome, rotulo });
  };

  Object.entries(SETORES_CONVIDADOS).forEach(([sigla, nome]) => inserir(sigla, nome));
  (Array.isArray(extras) ? extras : []).forEach(sigla => inserir(sigla, SETORES_CONVIDADOS[sigla] || ''));

  return ORDEM_GRUPOS_SETORES
    .map(grupo => ({
      grupo,
      itens: mapa.get(grupo).sort((a, b) => a.sigla.localeCompare(b.sigla, 'pt-BR', { numeric: true }))
    }))
    .filter(g => g.itens.length > 0);
}

function construirOptionsSetoresAgrupados(selecionado = '', opcoes = {}){
  const placeholder = opcoes.placeholder ?? 'Selecione a unidade';
  const extras = Array.isArray(opcoes.extras) ? opcoes.extras : [];
  const incluirOutra = Boolean(opcoes.incluirOutra);
  const grupos = obterGruposSetores(extras);
  const todasSiglas = new Set(grupos.flatMap(g => g.itens.map(i => i.sigla)));
  const atual = String(selecionado || '').trim();
  const atualOutra = incluirOutra && atual && !todasSiglas.has(atual);

  const partes = [];
  if(placeholder !== null){
    partes.push(`<option value="" ${!atual ? 'selected' : ''}>${escapeHtml(placeholder)}</option>`);
  }
  grupos.forEach(({ grupo, itens }) => {
    partes.push(`<optgroup label="${escapeHtml(grupo)}">${itens.map(item =>
      `<option value="${escapeHtml(item.sigla)}" ${atual === item.sigla ? 'selected' : ''}>${escapeHtml(item.rotulo)}</option>`
    ).join('')}</optgroup>`);
  });
  if(incluirOutra){
    partes.push(`<optgroup label="Personalizada"><option value="__OUTRA__" ${atualOutra ? 'selected' : ''}>Outra unidade...</option></optgroup>`);
  }
  return partes.join('');
}

function popularSetoresConvidados(){
  configurarBuscaSetor('r-participante-setor','r-participante-setor-sugestoes');
  configurarBuscaSetor('edit-r-participante-setor','edit-r-participante-setor-sugestoes');
}

function configurarBuscaSetor(campoId, sugestoesId){
  const campo = document.getElementById(campoId);
  const sugestoes = document.getElementById(sugestoesId);
  if(!campo || !sugestoes || campo._buscaSetorConfigurada || typeof campo.addEventListener !== 'function') return;
  campo._buscaSetorConfigurada = true;

  const esconder = ()=>{ sugestoes.hidden = true; };
  const atualizar = ()=>{
    const termo = campo.value.trim().toLocaleUpperCase('pt-BR');
    const grupos = obterGruposSetores().map(({ grupo, itens }) => ({
      grupo,
      itens: itens.filter(item =>
        !termo ||
        item.sigla.toLocaleUpperCase('pt-BR').includes(termo) ||
        item.nome.toLocaleUpperCase('pt-BR').includes(termo) ||
        grupo.toLocaleUpperCase('pt-BR').includes(termo)
      )
    })).filter(g => g.itens.length > 0);

    sugestoes.innerHTML = grupos.map(({ grupo, itens }) =>
      `<div class="setor-sugestao-grupo">${escapeHtml(grupo)}</div>` +
      itens.map(item =>
        `<button type="button" role="option" data-sigla="${escapeHtml(item.sigla)}" title="${escapeHtml(item.rotulo)}"><strong class="setor-sugestao-sigla">${escapeHtml(item.sigla)}</strong><span class="setor-sugestao-nome">${escapeHtml(item.nome)}</span></button>`
      ).join('')
    ).join('');
    sugestoes.hidden = grupos.length === 0;
  };

  campo.addEventListener('input',()=>{
    campo.value = campo.value.toUpperCase();
    atualizar();
  });
  campo.addEventListener('focus',atualizar);
  campo.addEventListener('blur',()=>setTimeout(esconder,140));
  sugestoes.addEventListener('mousedown',evento=>{
    const opcao = evento.target.closest('[data-sigla]');
    if(!opcao) return;
    evento.preventDefault();
    campo.value = opcao.dataset.sigla;
    esconder();
    campo.focus();
  });
}
