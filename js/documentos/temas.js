const TEMAS_DOCUMENTOS = [
  {
    "area": "Governança e gestão de TI",
    "temas": [
      "Política de Governança de Tecnologia da Informação",
      "Política de Gestão de TI",
      "Regimento Interno do Comitê de Governança de TI (CGOVTIC)",
      "Regimento Interno do Comitê de Gestão de TI (CGTIC)",
      "Política de Gestão de Riscos de TI",
      "Política de Gestão de Indicadores e Metas de TI",
      "Política de Priorização de Demandas de TI",
      "Metodologia de Planejamento Estratégico de TI",
      "Política de Monitoramento e Avaliação da Governança de TI",
      "Procedimentos para acompanhamento do PDTIC"
    ]
  },
  {
    "area": "Segurança da informação e cibersegurança",
    "temas": [
      "Política de Segurança da Informação (PSI)",
      "Política de Controle de Acesso aos Sistemas",
      "Política de Gestão de Identidades e Acessos",
      "Política de Autenticação Multifator (MFA)",
      "Política de Gestão de Senhas",
      "Política de Uso Aceitável dos Recursos de TI",
      "Política de Segurança de Redes",
      "Política de Gestão de Vulnerabilidades",
      "Política de Atualização e Correção de Sistemas (Patch Management)",
      "Política de Resposta a Incidentes de Segurança",
      "Plano de Tratamento de Incidentes Cibernéticos",
      "Política de Segurança para Trabalho Remoto",
      "Política de Gestão de Privilégios Administrativos"
    ]
  },
  {
    "area": "Gestão de serviços de TI",
    "temas": [
      "Política de Gerenciamento de Serviços de TI",
      "Catálogo de Serviços de TI",
      "Política de Gerenciamento de Incidentes",
      "Política de Gerenciamento de Problemas",
      "Política de Gerenciamento de Mudanças",
      "Política de Gerenciamento de Configuração",
      "Política de Gerenciamento de Ativos de TI",
      "Política de Acordos de Nível de Serviço (SLA)",
      "Política de Atendimento e Suporte Técnico",
      "Procedimentos de escalonamento de chamados",
      "Política de Gestão do Conhecimento de TI"
    ]
  },
  {
    "area": "Infraestrutura tecnológica e redes",
    "temas": [
      "Política de Administração de Servidores",
      "Política de Gestão de Redes e Conectividade",
      "Política de Utilização da Rede Institucional",
      "Política de Administração de Data Center",
      "Política de Virtualização de Servidores",
      "Política de Computação em Nuvem",
      "Política de Gestão de Equipamentos de TI",
      "Política de Monitoramento da Infraestrutura",
      "Política de Administração de Bancos de Dados",
      "Política de Gestão de Certificados Digitais",
      "Política de Continuidade dos Serviços de Infraestrutura"
    ]
  },
  {
    "area": "Desenvolvimento e manutenção de sistemas",
    "temas": [
      "Política de Desenvolvimento de Sistemas",
      "Metodologia de Desenvolvimento de Software",
      "Política de Gestão do Ciclo de Vida de Sistemas",
      "Política de Controle de Versões de Software",
      "Política de Gestão de Repositórios de Código-Fonte",
      "Política de Homologação e Implantação de Sistemas",
      "Política de Gestão de Mudanças em Sistemas",
      "Política de Documentação Técnica",
      "Política de Integração entre Sistemas",
      "Política de Desenvolvimento Seguro (DevSecOps)",
      "Política de Uso de Software de Código Aberto"
    ]
  },
  {
    "area": "Governança e gestão de dados",
    "temas": [
      "Política de Governança de Dados",
      "Política de Gestão e Qualidade de Dados",
      "Política de Classificação da Informação",
      "Política de Compartilhamento de Dados",
      "Política de Armazenamento e Retenção de Dados",
      "Política de Descarte Seguro de Dados",
      "Política de Gestão de Dados Institucionais",
      "Política de Acesso a Bases de Dados",
      "Política de Dados Abertos",
      "Política de Interoperabilidade"
    ]
  },
  {
    "area": "Proteção de dados pessoais e LGPD",
    "temas": [
      "Política de Proteção de Dados Pessoais",
      "Procedimentos para tratamento de dados pessoais",
      "Política de Controle de Acesso a Dados Pessoais",
      "Procedimentos para comunicação de incidentes envolvendo dados pessoais",
      "Política de anonimização e pseudonimização",
      "Procedimentos para atendimento aos direitos dos titulares",
      "Política de compartilhamento de dados pessoais com terceiros"
    ]
  },
  {
    "area": "Continuidade de negócios e recuperação de desastres",
    "temas": [
      "Política de Continuidade de Serviços de TI",
      "Plano de Continuidade de Serviços de TI (PCSTI)",
      "Plano de Recuperação de Desastres (PRD)",
      "Política de Backup e Restauração",
      "Política de Replicação de Dados",
      "Política de Testes de Continuidade",
      "Procedimentos de contingência de sistemas críticos",
      "Política de Gestão de Indisponibilidade de Serviços"
    ]
  },
  {
    "area": "Contratações e aquisições de TI",
    "temas": [
      "Política de Contratações de Soluções de TI",
      "Procedimentos para elaboração de Estudos Técnicos Preliminares",
      "Procedimentos para elaboração de Termos de Referência",
      "Política de Gestão e Fiscalização de Contratos de TI",
      "Política de Gestão de Fornecedores de Tecnologia",
      "Política de Gestão de Riscos nas Contratações de TI",
      "Procedimentos para recebimento e aceite de soluções tecnológicas",
      "Política de Gestão de Licenças de Software",
      "Política de Sustentabilidade nas Aquisições de TI"
    ]
  },
  {
    "area": "Ativos, equipamentos e softwares",
    "temas": [
      "Política de Gestão do Ciclo de Vida dos Ativos de TI",
      "Política de Distribuição e Recolhimento de Equipamentos",
      "Política de Uso de Dispositivos Móveis",
      "Política de Utilização de Equipamentos Institucionais",
      "Política de Inventário de Ativos de TI",
      "Política de Instalação e Utilização de Softwares",
      "Política de Licenciamento de Software",
      "Procedimentos para descarte de equipamentos eletrônicos"
    ]
  },
  {
    "area": "Inteligência artificial e inovação tecnológica",
    "temas": [
      "Política de Uso de Inteligência Artificial no âmbito institucional",
      "Diretrizes para utilização de IA generativa",
      "Política de Governança de Soluções de IA",
      "Procedimentos para avaliação de riscos de IA",
      "Política de Automação de Processos",
      "Diretrizes para utilização de ferramentas tecnológicas externas",
      "Política de Experimentação e Inovação Tecnológica",
      "Política de Desenvolvimento e Uso de Soluções de Automação"
    ]
  },
  {
    "area": "Gestão de projetos e portfólio de TI",
    "temas": [
      "Metodologia de Gerenciamento de Projetos de TI",
      "Política de Gestão do Portfólio de Projetos",
      "Política de Priorização de Projetos de TI",
      "Procedimentos para abertura e encerramento de projetos",
      "Política de Monitoramento de Projetos",
      "Metodologia de Gestão de Riscos de Projetos",
      "Política de Gestão de Indicadores de Projetos",
      "Procedimentos para prestação de contas de projetos de TI"
    ]
  },
  {
    "area": "Acessibilidade e experiência do usuário",
    "temas": [
      "Política de Acessibilidade Digital",
      "Diretrizes para desenvolvimento de sistemas acessíveis",
      "Política de Usabilidade de Sistemas Institucionais",
      "Procedimentos para avaliação da experiência do usuário",
      "Política de atendimento tecnológico aos usuários internos"
    ]
  },
  {
    "area": "Auditoria, conformidade e controles de TI",
    "temas": [
      "Política de Controles Internos de TI",
      "Política de Conformidade e Compliance de TI",
      "Política de Auditoria de Sistemas",
      "Política de Gestão de Evidências de TI",
      "Procedimentos de monitoramento de recomendações de auditoria",
      "Política de Gestão de Não Conformidades",
      "Política de Monitoramento dos Indicadores de Governança",
      "Procedimentos de avaliação de maturidade de TI"
    ]
  },
  {
    "area": "Capacitação e gestão do conhecimento",
    "temas": [
      "Política de Capacitação em Tecnologia da Informação",
      "Plano de Desenvolvimento de Competências de TI",
      "Política de Gestão do Conhecimento",
      "Procedimentos de transferência de conhecimento técnico",
      "Política de documentação de procedimentos operacionais",
      "Diretrizes para disseminação de boas práticas tecnológicas"
    ]
  }
];
function atualizarTemasDocumento(prefixo, tema=''){
  const area=document.getElementById(prefixo+'-area-tematica');
  const campo=document.getElementById(prefixo+'-tema');
  const lista=document.getElementById(prefixo+'-temas-opcoes');
  if(!area || !campo || !lista) return;
  const grupo=TEMAS_DOCUMENTOS.find(item=>item.area===area.value);
  lista.replaceChildren();
  lista.hidden=true;
  campo.setAttribute('aria-expanded','false');
  campo.value=tema;campo.disabled=!grupo;
}
function definirTemaDocumento(prefixo, area='', tema=''){
  const seletor=document.getElementById(prefixo+'-area-tematica');
  if(!seletor) return;
  seletor.value=area;atualizarTemasDocumento(prefixo,tema);
}
function lerTemaDocumento(prefixo){
  const areaTematica=document.getElementById(prefixo+'-area-tematica')?.value || '';
  const tema=document.getElementById(prefixo+'-tema')?.value.trim() || '';
  const grupo=TEMAS_DOCUMENTOS.find(item=>item.area===areaTematica);
  if((areaTematica && !grupo) || (tema && !grupo?.temas.includes(tema))){
    const campo=document.getElementById(prefixo+'-tema');
    mostrarErroCampo(campo,'Escolha um tema da área selecionada.');campo?.focus();return null;
  }
  return {areaTematica,tema};
}
document.addEventListener('DOMContentLoaded',()=>{
  ['f','edit'].forEach(prefixo=>{
    const seletor=document.getElementById(prefixo+'-area-tematica');if(!seletor)return;
    TEMAS_DOCUMENTOS.forEach(grupo=>{
      const opcao=document.createElement('option');opcao.value=grupo.area;opcao.textContent=grupo.area;seletor.appendChild(opcao);
    });
    seletor.addEventListener('change',()=>atualizarTemasDocumento(prefixo));atualizarTemasDocumento(prefixo);
    configurarBuscaTemaDocumento(prefixo);
  });
});

function configurarBuscaTemaDocumento(prefixo){
  const campo=document.getElementById(prefixo+'-tema');
  const lista=document.getElementById(prefixo+'-temas-opcoes');
  const normalizar=texto=>texto.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const abrir=(filtrar=false)=>{
    if(campo.disabled) return;
    fecharSeletoresToolbar(campo.parentElement);
    const area=document.getElementById(prefixo+'-area-tematica').value;
    const temas=TEMAS_DOCUMENTOS.find(item=>item.area===area)?.temas || [];
    const encontrados=temas.filter(tema=>!filtrar || normalizar(tema).includes(normalizar(campo.value)));
    lista.replaceChildren(...encontrados.map(tema=>{
      const opcao=document.createElement('button');
      opcao.type='button';opcao.textContent=tema;
      opcao.setAttribute('role','option');
      opcao.setAttribute('aria-selected',String(campo.value===tema));
      opcao.classList.toggle('selecionada',campo.value===tema);
      opcao.addEventListener('mousedown',evento=>evento.preventDefault());
      opcao.addEventListener('click',()=>{
        campo.value=tema;campo.focus();lista.hidden=true;campo.setAttribute('aria-expanded','false');
        limparErroCampo(campo);
      });
      return opcao;
    }));
    if(!encontrados.length){
      const vazio=document.createElement('div');
      vazio.className='tema-documento-vazio';vazio.textContent='Nenhum tema encontrado.';
      lista.appendChild(vazio);
    }
    lista.hidden=false;campo.setAttribute('aria-expanded','true');
    posicionarOpcoesToolbar(campo,lista);
  };
  campo.addEventListener('focus',()=>abrir());
  campo.addEventListener('click',()=>abrir());
  campo.addEventListener('input',()=>abrir(true));
  campo.addEventListener('keydown',evento=>{
    if(evento.key==='ArrowDown'){
      evento.preventDefault();if(lista.hidden) abrir();lista.querySelector('button')?.focus();
    }
    if(evento.key==='Enter') evento.preventDefault();
  });
  lista.addEventListener('keydown',evento=>{
    if(!['ArrowDown','ArrowUp'].includes(evento.key)) return;
    evento.preventDefault();
    const itens=[...lista.querySelectorAll('button')];
    const indice=itens.indexOf(document.activeElement);
    itens[(indice+(evento.key==='ArrowDown'?1:-1)+itens.length)%itens.length]?.focus();
  });
  campo.parentElement.addEventListener('keydown',evento=>{
    if(evento.key==='Escape'){
      evento.stopPropagation();campo.focus();lista.hidden=true;campo.setAttribute('aria-expanded','false');
    }
  });
  campo.parentElement.addEventListener('focusout',evento=>{
    if(!campo.parentElement.contains(evento.relatedTarget)){
      lista.hidden=true;campo.setAttribute('aria-expanded','false');
    }
  });
}
