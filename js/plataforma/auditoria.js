/* ===== ACOMPANHAMENTO DE AUDITORIA (SEAPTIC - COAUDI E NOVAS AUDITORIAS) ===== */

const AUDITORIAS_STORAGE_KEY = 'normatic:auditorias:v1';

const AUDITORIAS_PDF_SEED = [
  {
    id: 'aud-0000026-2020-1-1',
    processoSei: '0000026-23.2020.6.01.8000',
    assunto: 'Auditoria Integrada no Processo de Gestão de Infraestrutura de TIC, com Enfoque na Gestão de Ativos',
    numeroAchado: '1',
    descricaoAchado: 'NÃO IDENTIFICAÇÃO DOS REQUISITOS DE SEGURANÇA E NÍVEL DE CRITICIDADE ASSOCIADOS AOS ATIVOS',
    numeroRecomendacao: '1.1',
    descricaoRecomendacao: 'Executar atividades de identificação de requisitos de segurança e níveis de criticidade associados aos ativos de TI, inserindo tais dados nos sistemas utilizados para o inventário e o controle da gestão de ativos de TIC.',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2021-10-01'
  },
  {
    id: 'aud-0000026-2020-2-1',
    processoSei: '0000026-23.2020.6.01.8000',
    assunto: 'Auditoria Integrada no Processo de Gestão de Infraestrutura de TIC, com Enfoque na Gestão de Ativos',
    numeroAchado: '2',
    descricaoAchado: 'INEXISTÊNCIA DE MECANISMOS DE INTEGRIDADE CAPAZES DE DETECTAR POSSÍVEIS REGISTROS EM DUPLICIDADE E OUTRAS DISTORÇÕES',
    numeroRecomendacao: '2.1',
    descricaoRecomendacao: 'Avaliar, identificar e adotar ferramentas de gerenciamento capazes de evitar registros de ativos de TI em duplicidade ou distorcidos, sem prejuízo da execução periódica e por amostragem de conferência de registros contidos nos sistemas que adota para a realização de inventário, a fim de detectar possíveis registros em duplicidade e outras distorções.',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2021-10-01'
  },
  {
    id: 'aud-0000026-2020-3-1',
    processoSei: '0000026-23.2020.6.01.8000',
    assunto: 'Auditoria Integrada no Processo de Gestão de Infraestrutura de TIC, com Enfoque na Gestão de Ativos',
    numeroAchado: '3',
    descricaoAchado: 'INEXISTÊNCIA DE NORMA QUE DEFINA OS PROCEDIMENTOS PARA INUTILIZAÇÃO DOS DADOS ARMAZENADOS NO STORAGE',
    numeroRecomendacao: '3.1',
    descricaoRecomendacao: 'Incluir na norma a ser elaborada sobre gestão de ativos, conforme recomendado na auditoria de avaliação do cumprimento das metas da ENTIC-JUD (0002534-10.2018.6.01.8000) regulamentação específica sobre procedimentos de inutilização dos dados armazenados nos storage;',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2021-10-01'
  },
  {
    id: 'aud-0000026-2020-3-2',
    processoSei: '0000026-23.2020.6.01.8000',
    assunto: 'Auditoria Integrada no Processo de Gestão de Infraestrutura de TIC, com Enfoque na Gestão de Ativos',
    numeroAchado: '3',
    descricaoAchado: 'INEXISTÊNCIA DE NORMA QUE DEFINA OS PROCEDIMENTOS PARA INUTILIZAÇÃO DOS DADOS ARMAZENADOS NO STORAGE',
    numeroRecomendacao: '3.2',
    descricaoRecomendacao: 'Até que seja editada a norma interna objeto da recomendação anterior, deverá a STI estabelecer protocolos de execução dos procedimentos a serem observados para a inutilização de dados armazenados no storage.',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2021-10-01'
  },
  {
    id: 'aud-0000026-2020-4-1',
    processoSei: '0000026-23.2020.6.01.8000',
    assunto: 'Auditoria Integrada no Processo de Gestão de Infraestrutura de TIC, com Enfoque na Gestão de Ativos',
    numeroAchado: '4',
    descricaoAchado: 'INEXISTÊNCIA DE PROCEDIMENTO FORMAL DE DESCARTE/ DESINSTALAÇÃO DE SOFTWARE E DE DESCONTINUIDADE DE USO DAS LICENÇAS DE OFFICE',
    numeroRecomendacao: '4.1',
    descricaoRecomendacao: 'Incluir na norma a ser elaborada sobre gestão de ativos, conforme recomendado na auditoria de avaliação do cumprimento das metas da ENTIC-JUD (0002534-10.2018.6.01.8000) regulamentação específica sobre procedimentos de desfazimento de softwares;',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2021-10-01'
  },
  {
    id: 'aud-0000026-2020-4-2',
    processoSei: '0000026-23.2020.6.01.8000',
    assunto: 'Auditoria Integrada no Processo de Gestão de Infraestrutura de TIC, com Enfoque na Gestão de Ativos',
    numeroAchado: '4',
    descricaoAchado: 'INEXISTÊNCIA DE PROCEDIMENTO FORMAL DE DESCARTE/ DESINSTALAÇÃO DE SOFTWARE E DE DESCONTINUIDADE DE USO DAS LICENÇAS DE OFFICE',
    numeroRecomendacao: '4.2',
    descricaoRecomendacao: 'Até que seja editado o normativo objeto da recomendação anterior, deverá a STI estabelecer protocolos de execução dos procedimentos a serem observados para o desfazimento de softwares.',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2021-10-01'
  },
  {
    id: 'aud-0000026-2020-6-1',
    processoSei: '0000026-23.2020.6.01.8000',
    assunto: 'Auditoria Integrada no Processo de Gestão de Infraestrutura de TIC, com Enfoque na Gestão de Ativos',
    numeroAchado: '6',
    descricaoAchado: 'INEXISTÊNCIA DE NORMA INTERNA QUE DISCIPLINA O DESFAZIMENTO DE ATIVOS DE TIC, SOBRETUDO NO QUE CONCERNE À DEFINIÇÃO DE CRITÉRIOS DE INSERVIBILIDADE, PROCEDIMENTOS TÉCNICOS DE DESFAZIMENTO E CARACTERIZAÇÃO DA AUSÊNCIA DE INTERESSE NO USO DOS ATIVOS',
    numeroRecomendacao: '6.1',
    descricaoRecomendacao: 'Incluir na norma a ser elaborada sobre gestão de ativos, conforme recomendado na auditoria de avaliação do cumprimento das metas da ENTIC-JUD (0002534-10.2018.6.01.8000) regulamentação específica acerca dos procedimentos de desfazimento de ativos de TIC.',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2021-10-01'
  },
  {
    id: 'aud-0000026-2020-6-2',
    processoSei: '0000026-23.2020.6.01.8000',
    assunto: 'Auditoria Integrada no Processo de Gestão de Infraestrutura de TIC, com Enfoque na Gestão de Ativos',
    numeroAchado: '6',
    descricaoAchado: 'INEXISTÊNCIA DE NORMA INTERNA QUE DISCIPLINA O DESFAZIMENTO DE ATIVOS DE TIC, SOBRETUDO NO QUE CONCERNE À DEFINIÇÃO DE CRITÉRIOS DE INSERVIBILIDADE, PROCEDIMENTOS TÉCNICOS DE DESFAZIMENTO E CARACTERIZAÇÃO DA AUSÊNCIA DE INTERESSE NO USO DOS ATIVOS',
    numeroRecomendacao: '6.2',
    descricaoRecomendacao: 'Até que seja editado o normativo objeto da recomendação anterior, deverá a STI estabelecer protocolos de execução dos procedimentos a serem observados para o desfazimento de ativos de TIC.',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2021-10-01'
  },
  {
    id: 'aud-0000026-2020-7-1',
    processoSei: '0000026-23.2020.6.01.8000',
    assunto: 'Auditoria Integrada no Processo de Gestão de Infraestrutura de TIC, com Enfoque na Gestão de Ativos',
    numeroAchado: '7',
    descricaoAchado: 'INEXISTÊNCIA DE CONTROLES QUE PERMITAM ESTABELECER CORRESPONDÊNCIAS ENTRE O QUANTITATIVO DE LICENÇAS DE SOFTWARE INSTALADO COM O EFETIVAMENTE CONTRATADO',
    numeroRecomendacao: '7.1',
    descricaoRecomendacao: 'Implementar procedimentos de controle que permitam: a) efetuar regularmente verificações para identificar todas as instâncias do software licenciado instalado;',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2021-10-01'
  },
  {
    id: 'aud-0000026-2020-7-2',
    processoSei: '0000026-23.2020.6.01.8000',
    assunto: 'Auditoria Integrada no Processo de Gestão de Infraestrutura de TIC, com Enfoque na Gestão de Ativos',
    numeroAchado: '7',
    descricaoAchado: 'INEXISTÊNCIA DE CONTROLES QUE PERMITAM ESTABELECER CORRESPONDÊNCIAS ENTRE O QUANTITATIVO DE LICENÇAS DE SOFTWARE INSTALADO COM O EFETIVAMENTE CONTRATADO',
    numeroRecomendacao: '7.2',
    descricaoRecomendacao: 'Implementar procedimentos de controle que permitam: b) comparar o número de instâncias de software instaladas com o número de licenças de propriedade.',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2021-10-01'
  },
  {
    id: 'aud-0000026-2020-9-1',
    processoSei: '0000026-23.2020.6.01.8000',
    assunto: 'Auditoria Integrada no Processo de Gestão de Infraestrutura de TIC, com Enfoque na Gestão de Ativos',
    numeroAchado: '9',
    descricaoAchado: 'INEXISTÊNCIA DE CONTROLES PARA O MONITORAMENTO DOS PRAZOS DE GARANTIA DOS EQUIPAMENTOS DE TIC',
    numeroRecomendacao: '9.1',
    descricaoRecomendacao: 'Incluir na norma a ser elaborada sobre gestão de ativos, conforme recomendado na auditoria de avaliação do cumprimento das metas da ENTIC-JUD (0002534-10.2018.6.01.8000) regulamentação específica acerca dos critérios adotados para a renovação do parque de máquinas, levando em conta, dentre outros, o período de garantia.',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2021-10-01'
  },
  {
    id: 'aud-0000026-2020-9-2',
    processoSei: '0000026-23.2020.6.01.8000',
    assunto: 'Auditoria Integrada no Processo de Gestão de Infraestrutura de TIC, com Enfoque na Gestão de Ativos',
    numeroAchado: '9',
    descricaoAchado: 'INEXISTÊNCIA DE CONTROLES PARA O MONITORAMENTO DOS PRAZOS DE GARANTIA DOS EQUIPAMENTOS DE TIC',
    numeroRecomendacao: '9.2',
    descricaoRecomendacao: 'Até que seja editado o normativo objeto da recomendação anterior, deverá a STI estabelecer protocolos de execução dos procedimentos a serem observados para a renovação do parque de máquinas.',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2021-10-01'
  },
  {
    id: 'aud-0001377-2020-1-1',
    processoSei: '0001377-31.2020.6.01.8000',
    assunto: 'Auditoria de Avaliação da Aderência dos Processos de Aquisição/contratação de Soluções de Tecnologia da Informação e Comunicação (TIC) do TRE-Acre às normas da Resolução CNJ nº 182/2013.',
    numeroAchado: '1',
    descricaoAchado: 'Inexistência de norma que define o modelo do processo de contratação de TIC',
    numeroRecomendacao: '1.1',
    descricaoRecomendacao: 'a) Determinar que sejam retomadas as discussões pelas unidades competentes - COMAP, ASLIC, STI/CIE - em torno da minuta da norma interna que irá disciplinar o processo de contratação de TI, o que, já está sendo feito no âmbito do Processo SEI 0003231-60.2016.6.24.8000, mas que, até a presente data, não foi concluído;',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2020-11-11'
  },
  {
    id: 'aud-0001377-2020-1-2',
    processoSei: '0001377-31.2020.6.01.8000',
    assunto: 'Auditoria de Avaliação da Aderência dos Processos de Aquisição/contratação de Soluções de Tecnologia da Informação e Comunicação (TIC) do TRE-Acre às normas da Resolução CNJ nº 182/2013.',
    numeroAchado: '1',
    descricaoAchado: 'Inexistência de norma que define o modelo do processo de contratação de TIC',
    numeroRecomendacao: '1.2',
    descricaoRecomendacao: 'b) A par da elaboração da norma, deverá ser elaborado o manual do processo de contratação de soluções de TIC, a exemplo do que fez o TRE-RN (http://www.tre-rn.jus.br/transparencia/governanca-e-gestao-de-tic/outros/manual-do-processo-de-contratacoes-de-tic-versao-2.0);',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2020-11-11'
  },
  {
    id: 'aud-0001377-2020-5-1',
    processoSei: '0001377-31.2020.6.01.8000',
    assunto: 'Auditoria de Avaliação da Aderência dos Processos de Aquisição/contratação de Soluções de Tecnologia da Informação e Comunicação (TIC) do TRE-Acre às normas da Resolução CNJ nº 182/2013.',
    numeroAchado: '5',
    descricaoAchado: 'Ausência de elaboração dos estudos técnicos preliminares e do termo de referência nos processos de contratação por adesão',
    numeroRecomendacao: '5.1',
    descricaoRecomendacao: 'a) Ao gestor da área de TI: instituir controles que mitiguem os riscos de tramitação de processos de contratação por adesão sem que dele constem os artefatos exigidos na fase de planejamento;',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2020-11-11'
  },
  {
    id: 'aud-0001377-2020-11-1',
    processoSei: '0001377-31.2020.6.01.8000',
    assunto: 'Auditoria de Avaliação da Aderência dos Processos de Aquisição/contratação de Soluções de Tecnologia da Informação e Comunicação (TIC) do TRE-Acre às normas da Resolução CNJ nº 182/2013.',
    numeroAchado: '11',
    descricaoAchado: 'As prorrogações de contratos de TI não são instruídas com o documento de análise de viabilidade da contratação',
    numeroRecomendacao: '11.1',
    descricaoRecomendacao: 'a) Aos gestores de contratos de TI: Providenciar, na instrução dos processos de renovação contratual, a elaboração dos seguintes documentos: identificação das diferentes Soluções de Tecnologia da Informação e Comunicação que atendam aos requisitos, considerando: disponibilidade de Solução de Tecnologia da Informação e Comunicação similar em outro órgão ou entidade da Administração Pública; a capacidade e as alternativas do mercado de TIC, inclusive a existência de software livre ou software público; o orçamento estimado que expresse a composição de todos os custos unitários resultantes dos itens a serem contratados, elaborado com base em pesquisa fundamentada de preços, como os praticados no mercado de Tecnologia da Informação e Comunicação em contratações similares realizadas por órgãos ou entidades da Administração Pública, entre outros pertinentes; a análise e a comparação entre os custos totais das Soluções de Tecnologia da Informação e Comunicação identificadas, levando-se em conta os valores de aquisição dos produtos, insumos, garantia e serviços complementares, quando necessários à contratação;',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2020-11-11'
  },
  {
    id: 'aud-0000779-2015-6',
    processoSei: '0000779-14.2015.6.24.8000',
    assunto: 'Avaliação dos controles internos',
    numeroAchado: '6',
    descricaoAchado: 'Avaliação dos controles internos (Achado 6)',
    numeroRecomendacao: '6',
    descricaoRecomendacao: 'Que sejam adotadas providências para que os controles internos sejam realizados de forma mais automatizada possível, objetivando atender as demandas de forma rápida dentro dos prazos estabelecidos, o que melhoraria os controles e o gerenciamento dos riscos. O COCIN sugeriu a intervenção da TI – ante as necessidades a serem expostas pelas unidades, para verificar quais os dados informatizados devam ser extraídos dos sistemas e sua periodicidade, elaborando, sendo o caso, plano de ação respectivo.',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2015-09-04'
  },
  {
    id: 'aud-0001044-2022-1-1',
    processoSei: '0001044-11.2022.6.01.8000',
    assunto: 'Auditoria Integrada em Segurança da Informação (TSE)',
    numeroAchado: '1',
    descricaoAchado: 'Ausência de inventário de provedores de serviços e Sistemas Internos e Externos',
    numeroRecomendacao: '1.1',
    descricaoRecomendacao: 'À Administração para que atualize a Instrução Normativa TRE-AC n. 38, defina os responsáveis pelo controle aos Sistemas Internos e Externos e elabore rotinas e norma sobre a política de gestão de provedores de serviços.',
    unidadeResponsavel: 'DG / STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2023-01-19'
  },
  {
    id: 'aud-0001044-2022-1-2',
    processoSei: '0001044-11.2022.6.01.8000',
    assunto: 'Auditoria Integrada em Segurança da Informação (TSE)',
    numeroAchado: '1',
    descricaoAchado: 'Ausência de inventário de provedores de serviços e Sistemas Internos e Externos',
    numeroRecomendacao: '1.2',
    descricaoRecomendacao: 'À Administração, com a participação da STI, para que crie rotinas e normatize a realização periódica de inventário de provedores de serviços e de todos os Sistemas Internos e Externos utilizados pelas unidades do TRE-AC.',
    unidadeResponsavel: 'DG / STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2023-01-19'
  },
  {
    id: 'aud-0001044-2022-2-1',
    processoSei: '0001044-11.2022.6.01.8000',
    assunto: 'Auditoria Integrada em Segurança da Informação (TSE)',
    numeroAchado: '2',
    descricaoAchado: 'Existência de usuários desligados/aposentados ativos nos Sistemas Internos e Externos',
    numeroRecomendacao: '2.1',
    descricaoRecomendacao: 'À Administração para que normatize os controles dos Sistemas Internos e Externos.',
    unidadeResponsavel: 'DG / STI / SEREDE / SEMAP',
    status: 'Não implementada',
    inicioAcompanhamento: '2023-01-19'
  },
  {
    id: 'aud-0001044-2022-2-2',
    processoSei: '0001044-11.2022.6.01.8000',
    assunto: 'Auditoria Integrada em Segurança da Informação (TSE)',
    numeroAchado: '2',
    descricaoAchado: 'Existência de usuários desligados/aposentados ativos nos Sistemas Internos e Externos',
    numeroRecomendacao: '2.2',
    descricaoRecomendacao: 'À Administração atualize a política de controle de acesso físico e lógico, conforme art. 27 da Instrução Normativa TRE-AC nº 38/2018. E normatize a realização periódica de inventário de contas.',
    unidadeResponsavel: 'DG / STI / SEREDE / SEMAP',
    status: 'Não implementada',
    inicioAcompanhamento: '2023-01-19'
  },
  {
    id: 'aud-0000806-2026-6-1',
    processoSei: '0000806-50.2026.6.01.8000',
    assunto: 'Auditoria sobre a Política de segurança da Informação',
    numeroAchado: '6',
    descricaoAchado: 'Ausência de padronização e insuficiência de cláusulas específicas de Segurança da Informação nos contratos de TI do TRE-AC, especialmente quanto a confidencialidade, gestão de incidentes, controle de acesso, tratamento de dados, retenção de logs, continuidade dos serviços e responsabilização contratual.',
    numeroRecomendacao: '6.1',
    descricaoRecomendacao: 'Recomendar à STI, à unidade responsável pelas contratações de TI e à Comissão de Segurança da Informação para que: a) elaborem modelo padronizado de cláusulas de Segurança da Informação para contratos de TI;',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2023-01-20'
  },
  {
    id: 'aud-0000806-2026-6-2',
    processoSei: '0000806-50.2026.6.01.8000',
    assunto: 'Auditoria sobre a Política de segurança da Informação',
    numeroAchado: '6',
    descricaoAchado: 'Ausência de padronização e insuficiência de cláusulas específicas de Segurança da Informação nos contratos de TI do TRE-AC, especialmente quanto a confidencialidade, gestão de incidentes, controle de acesso, tratamento de dados, retenção de logs, continuidade dos serviços e responsabilização contratual.',
    numeroRecomendacao: '6.2',
    descricaoRecomendacao: 'Recomendar à STI, à unidade responsável pelas contratações de TI e à Comissão de Segurança da Informação para que: b) incluam requisitos mínimos de confidencialidade, controle de acesso, tratamento de incidentes, retenção de logs, continuidade de serviços, proteção de dados pessoais e responsabilização contratual;',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2023-01-21'
  },
  {
    id: 'aud-0000806-2026-6-3',
    processoSei: '0000806-50.2026.6.01.8000',
    assunto: 'Auditoria sobre a Política de segurança da Informação',
    numeroAchado: '6',
    descricaoAchado: 'Ausência de padronização e insuficiência de cláusulas específicas de Segurança da Informação nos contratos de TI do TRE-AC, especialmente quanto a confidencialidade, gestão de incidentes, controle de acesso, tratamento de dados, retenção de logs, continuidade dos serviços e responsabilização contratual.',
    numeroRecomendacao: '6.3',
    descricaoRecomendacao: 'Recomendar à STI, à unidade responsável pelas contratações de TI e à Comissão de Segurança da Informação para que: c) instituam checklist obrigatório de conformidade da PSI nas fases de planejamento e fiscalização contratual.',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2023-01-22'
  },
  {
    id: 'aud-0000806-2026-6-4',
    processoSei: '0000806-50.2026.6.01.8000',
    assunto: 'Auditoria sobre a Política de segurança da Informação',
    numeroAchado: '6',
    descricaoAchado: 'Ausência de padronização e insuficiência de cláusulas específicas de Segurança da Informação nos contratos de TI do TRE-AC, especialmente quanto a confidencialidade, gestão de incidentes, controle de acesso, tratamento de dados, retenção de logs, continuidade dos serviços e responsabilização contratual.',
    numeroRecomendacao: '6.4',
    descricaoRecomendacao: 'Recomendar à STI, à unidade responsável pelas contratações de TI e à Comissão de Segurança da Informação para que: d) promovam revisão dos contratos vigentes de TI para verificar se encontram adequados às diretrizes da PSI e à Lei nº 14.133/2021.',
    unidadeResponsavel: 'STI',
    status: 'Não implementada',
    inicioAcompanhamento: '2023-01-23'
  },
  {
    id: 'aud-0001608-2025-5-1',
    processoSei: '0001608-82.2025.6.01.8000',
    assunto: 'Auditoria em Contas Anuais - Exercício 2025',
    numeroAchado: '5',
    descricaoAchado: 'Manutenção indevida de softwares sem uso',
    numeroRecomendacao: '5.1',
    descricaoRecomendacao: 'À Secretaria de Tecnologia da Informação - STI para: Analisar todos os softwares registrados e solicitar a baixa contábil dos softwares sem uso.',
    unidadeResponsavel: 'STI',
    status: 'Em implementação',
    inicioAcompanhamento: '2023-01-24'
  },
  {
    id: 'aud-0001608-2025-6-1',
    processoSei: '0001608-82.2025.6.01.8000',
    assunto: 'Auditoria em Contas Anuais - Exercício 2025',
    numeroAchado: '6',
    descricaoAchado: 'Ausência de registros contábeis dos softwares desenvolvidos internamente. (0862616 - p. 50 e/ou fl. 48 do relatório).',
    numeroRecomendacao: '6.1',
    descricaoRecomendacao: 'À Secretaria de Tecnologia da Informação - STI para: Avaliar se os sistemas desenvolvidos internamente atendem aos critérios de reconhecimento contábil.',
    unidadeResponsavel: 'STI',
    status: 'Em implementação',
    inicioAcompanhamento: '2023-01-25'
  }
];

let auditoriasLista = [];
let auditoriasCarregadas = false;
let abaAuditoria = 'visualizacao';
let auditoriaEditandoId = null;
let filtroAuditoriaBusca = '';
let filtroAuditoriaStatus = '';
let filtroAuditoriaUnidade = '';
let filtroAuditoriaProcesso = '';
let paginaAuditoria = 1;
const AUDITORIA_ITENS_POR_PAGINA = 10;

function normalizarStatusAuditoria(valor) {
  const texto = String(valor || '').trim().toLocaleLowerCase('pt-BR');
  if (texto === 'implementada') return 'Implementada';
  if (texto.includes('em implement')) return 'Em implementação';
  return 'Não implementada';
}

function classeStatusAuditoria(status) {
  const norm = normalizarStatusAuditoria(status);
  if (norm === 'Implementada') return 'implementada';
  if (norm === 'Em implementação') return 'em-implementacao';
  return 'nao-implementada';
}

function calcularTempoAguardandoAuditoria(inicioISO, status) {
  if (normalizarStatusAuditoria(status) === 'Implementada') return 'Cumprida';
  if (!inicioISO || !/^\d{4}-\d{2}-\d{2}$/.test(inicioISO)) return 'Não informado';
  const [anoIni, mesIni, diaIni] = inicioISO.split('-').map(Number);
  const inicio = new Date(anoIni, mesIni - 1, diaIni);
  const hoje = new Date();
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  if (fim < inicio) return '0 ano(s), 0 mes(es) e 0 dia(s)';

  let anos = fim.getFullYear() - inicio.getFullYear();
  let meses = fim.getMonth() - inicio.getMonth();
  let dias = fim.getDate() - inicio.getDate();

  if (dias < 0) {
    meses -= 1;
    const ultimoDiaMesAnterior = new Date(fim.getFullYear(), fim.getMonth(), 0).getDate();
    dias += ultimoDiaMesAnterior;
  }
  if (meses < 0) {
    anos -= 1;
    meses += 12;
  }
  return `${anos} ano(s), ${meses} mes(es) e ${dias} dia(s)`;
}

function formatarDataAuditoria(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '—';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

function normalizarRegistroAuditoria(item, index = 0) {
  return {
    id: String(item?.id || `aud-${Date.now()}-${index}`).slice(0, 100),
    processoSei: String(item?.processoSei || '').trim().slice(0, 80),
    assunto: String(item?.assunto || '').trim().slice(0, 400),
    numeroAchado: String(item?.numeroAchado || '').trim().slice(0, 30),
    descricaoAchado: String(item?.descricaoAchado || '').trim().slice(0, 2000),
    numeroRecomendacao: String(item?.numeroRecomendacao || '').trim().slice(0, 30),
    descricaoRecomendacao: String(item?.descricaoRecomendacao || '').trim().slice(0, 4000),
    unidadeResponsavel: String(item?.unidadeResponsavel || '').trim().slice(0, 120),
    status: normalizarStatusAuditoria(item?.status),
    inicioAcompanhamento: /^\d{4}-\d{2}-\d{2}$/.test(String(item?.inicioAcompanhamento || '')) ? String(item.inicioAcompanhamento) : ''
  };
}

function carregarAuditoriasLocal() {
  try {
    const bruto = localStorage.getItem(AUDITORIAS_STORAGE_KEY);
    if (bruto) {
      const parsed = JSON.parse(bruto);
      if (Array.isArray(parsed)) return parsed.map(normalizarRegistroAuditoria);
    }
  } catch (_) { /* Usa carga inicial do PDF. */ }
  const seed = AUDITORIAS_PDF_SEED.map(normalizarRegistroAuditoria);
  try { localStorage.setItem(AUDITORIAS_STORAGE_KEY, JSON.stringify(seed)); } catch (_) {}
  return seed;
}

async function carregarAuditorias() {
  if (!auditoriasCarregadas) {
    auditoriasLista = carregarAuditoriasLocal();
    auditoriasCarregadas = true;
  }
  if (window.NormaticCloud?.enabled && typeof window.NormaticCloud.readAuditorias === 'function') {
    try {
      const remoto = await window.NormaticCloud.readAuditorias();
      if (Array.isArray(remoto)) {
        if (remoto.length) {
          auditoriasLista = remoto.map(normalizarRegistroAuditoria);
        } else {
          auditoriasLista = AUDITORIAS_PDF_SEED.map(normalizarRegistroAuditoria);
        }
      }
    } catch (_) { /* Mantém dados carregados localmente. */ }
  }
  return auditoriasLista;
}

async function salvarAuditorias() {
  try {
    if (window.NormaticCloud?.enabled && typeof window.NormaticCloud.writeAuditorias === 'function') {
      const salvo = await window.NormaticCloud.writeAuditorias(auditoriasLista);
      if (Array.isArray(salvo)) {
        auditoriasLista = salvo.map(normalizarRegistroAuditoria);
        try { localStorage.setItem(AUDITORIAS_STORAGE_KEY, JSON.stringify(auditoriasLista)); } catch (_) {}
        return true;
      }
    }
    localStorage.setItem(AUDITORIAS_STORAGE_KEY, JSON.stringify(auditoriasLista));
    return true;
  } catch (error) {
    if (typeof toast === 'function') toast(escapeHtml(error?.message || 'Não foi possível salvar o acompanhamento de auditoria.'), 'vencido');
    else if (typeof notify === 'function') notify(error?.message || 'Não foi possível salvar o acompanhamento de auditoria.');
    return false;
  }
}

function obterAuditoriasFiltradas() {
  const termo = filtroAuditoriaBusca.trim().toLocaleLowerCase('pt-BR');
  return auditoriasLista.filter(item => {
    if (filtroAuditoriaStatus && item.status !== filtroAuditoriaStatus) return false;
    if (filtroAuditoriaUnidade && item.unidadeResponsavel !== filtroAuditoriaUnidade) return false;
    if (filtroAuditoriaProcesso && item.processoSei !== filtroAuditoriaProcesso) return false;
    if (termo) {
      const alvo = [
        item.processoSei,
        item.assunto,
        item.numeroAchado,
        item.descricaoAchado,
        item.numeroRecomendacao,
        item.descricaoRecomendacao,
        item.unidadeResponsavel,
        item.status
      ].join(' ').toLocaleLowerCase('pt-BR');
      if (!alvo.includes(termo)) return false;
    }
    return true;
  });
}

function trocarAbaAuditoria(aba) {
  abaAuditoria = aba === 'cadastro' ? 'cadastro' : 'visualizacao';
  if (abaAuditoria === 'visualizacao') auditoriaEditandoId = null;
  render();
}

function abrirCadastroAuditoria() {
  auditoriaEditandoId = null;
  abaAuditoria = 'cadastro';
  render();
}

function editarAuditoria(id) {
  const item = auditoriasLista.find(a => a.id === id);
  if (!item) return;
  auditoriaEditandoId = item.id;
  abaAuditoria = 'cadastro';
  render();
}

async function excluirAuditoria(id) {
  const item = auditoriasLista.find(a => a.id === id);
  if (!item) return;
  const ok = typeof window.confirm === 'function'
    ? window.confirm(`Deseja excluir a recomendação ${item.numeroRecomendacao} do processo ${item.processoSei}?`)
    : true;
  if (!ok) return;
  const anterior = [...auditoriasLista];
  auditoriasLista = auditoriasLista.filter(a => a.id !== id);
  const salvo = await salvarAuditorias();
  if (!salvo) {
    auditoriasLista = anterior;
    return;
  }
  if (typeof toast === 'function') toast('Recomendação excluída.', 'valido');
  render();
}

function visualizarDetalhesAuditoria(id) {
  const item = auditoriasLista.find(a => a.id === id);
  if (!item) return;
  const dialog = document.getElementById('details');
  if (!dialog) return;
  const editarBtn = document.getElementById('detailsEdit');
  const excluirBtn = document.getElementById('detailsDelete');
  document.getElementById('detailsTitle').textContent = `Recomendação ${item.numeroRecomendacao} · Achado ${item.numeroAchado}`;
  document.getElementById('detailsBody').innerHTML = `
    <div class="auditoria-detalhe-grid">
      <p><b>Processo SEI:</b> ${escapeHtml(item.processoSei)}</p>
      <p><b>Status:</b> <span class="auditoria-status-badge ${classeStatusAuditoria(item.status)}">${escapeHtml(item.status)}</span></p>
      <p><b>Unidade Responsável:</b> ${escapeHtml(item.unidadeResponsavel)}</p>
      <p><b>Início do Acompanhamento:</b> ${escapeHtml(formatarDataAuditoria(item.inicioAcompanhamento))}</p>
      <p><b>Tempo aguardando cumprimento:</b> ${escapeHtml(calcularTempoAguardandoAuditoria(item.inicioAcompanhamento, item.status))}</p>
    </div>
    <div class="auditoria-detalhe-bloco">
      <strong>Assunto</strong>
      <p>${escapeHtml(item.assunto)}</p>
    </div>
    <div class="auditoria-detalhe-bloco">
      <strong>Achado ${escapeHtml(item.numeroAchado)}</strong>
      <p>${escapeHtml(item.descricaoAchado)}</p>
    </div>
    <div class="auditoria-detalhe-bloco">
      <strong>Recomendação ${escapeHtml(item.numeroRecomendacao)}</strong>
      <p>${escapeHtml(item.descricaoRecomendacao)}</p>
    </div>
  `;
  if (editarBtn) {
    editarBtn.hidden = false;
    editarBtn.onclick = () => {
      dialog.close();
      editarAuditoria(item.id);
    };
  }
  if (excluirBtn) {
    excluirBtn.hidden = false;
    excluirBtn.onclick = () => {
      dialog.close();
      excluirAuditoria(item.id);
    };
  }
  dialog.showModal();
}

function limparFiltrosAuditoria() {
  filtroAuditoriaBusca = '';
  filtroAuditoriaStatus = '';
  filtroAuditoriaUnidade = '';
  filtroAuditoriaProcesso = '';
  paginaAuditoria = 1;
  render();
}

function irPaginaAuditoria(pagina) {
  paginaAuditoria = Math.max(1, Number(pagina) || 1);
  render();
}

function atualizarBuscaAuditoria(valor) {
  const input = document.getElementById('auditoria-busca');
  const caret = input?.selectionStart;
  filtroAuditoriaBusca = valor;
  paginaAuditoria = 1;
  render();
  const novo = document.getElementById('auditoria-busca');
  novo?.focus();
  if (caret != null) novo?.setSelectionRange?.(caret, caret);
}

function preencherAssuntoPorProcessoAuditoria(processoSei) {
  const campoAssunto = document.getElementById('aud-assunto');
  if (!campoAssunto || campoAssunto.value.trim()) return;
  const existente = auditoriasLista.find(a => a.processoSei === String(processoSei || '').trim());
  if (existente) campoAssunto.value = existente.assunto;
}

function atualizarProcessoSeiAuditoria(input) {
  if (!input) return;
  if (typeof formatarNumeroSei === 'function') {
    input.value = formatarNumeroSei(input.value);
  }
  preencherAssuntoPorProcessoAuditoria(input.value);
}

function alternarOutraUnidadeAuditoria(valor) {
  const wrap = document.getElementById('aud-unidade-outra-wrap');
  const campo = document.getElementById('aud-unidade-outra');
  const outra = valor === '__OUTRA__';
  if (wrap) wrap.hidden = !outra;
  if (campo) {
    campo.required = outra;
    if (!outra) campo.value = '';
    else campo.focus();
  }
}

async function salvarFormularioAuditoria(event) {
  event?.preventDefault();
  const seiBruto = String(document.getElementById('aud-processo-sei')?.value || '').trim();
  const seiValido = typeof numeroSeiValido === 'function' ? numeroSeiValido(seiBruto) : Boolean(seiBruto);
  if (!seiValido) {
    if (typeof toast === 'function') toast('Informe um Processo SEI válido (13 dígitos; .6.01.8000 é preenchido automaticamente).', 'vencido');
    document.getElementById('aud-processo-sei')?.focus();
    return;
  }
  const processoSeiFormatado = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/.test(seiBruto)
    ? seiBruto
    : (typeof formatarNumeroSei === 'function' ? formatarNumeroSei(seiBruto) : seiBruto);

  const unidadeSelecionada = document.getElementById('aud-unidade')?.value || '';
  const unidadeFinal = unidadeSelecionada === '__OUTRA__'
    ? String(document.getElementById('aud-unidade-outra')?.value || '').trim()
    : unidadeSelecionada;

  const registro = normalizarRegistroAuditoria({
    id: auditoriaEditandoId || `aud-${Date.now()}`,
    processoSei: processoSeiFormatado,
    assunto: document.getElementById('aud-assunto')?.value,
    numeroAchado: document.getElementById('aud-num-achado')?.value,
    descricaoAchado: document.getElementById('aud-desc-achado')?.value,
    numeroRecomendacao: document.getElementById('aud-num-rec')?.value,
    descricaoRecomendacao: document.getElementById('aud-desc-rec')?.value,
    unidadeResponsavel: unidadeFinal,
    status: document.getElementById('aud-status')?.value,
    inicioAcompanhamento: document.getElementById('aud-inicio')?.value
  });

  if (!registro.processoSei || !registro.assunto || !registro.numeroAchado || !registro.descricaoAchado || !registro.numeroRecomendacao || !registro.descricaoRecomendacao || !registro.unidadeResponsavel || !registro.inicioAcompanhamento) {
    if (typeof toast === 'function') toast('Preencha todos os campos obrigatórios.', 'vencido');
    return;
  }

  const anterior = [...auditoriasLista];
  if (auditoriaEditandoId) {
    const idx = auditoriasLista.findIndex(a => a.id === auditoriaEditandoId);
    if (idx >= 0) auditoriasLista[idx] = registro;
    else auditoriasLista.unshift(registro);
  } else {
    auditoriasLista.unshift(registro);
  }

  const salvo = await salvarAuditorias();
  if (!salvo) {
    auditoriasLista = anterior;
    return;
  }
  const eraEdicao = !!auditoriaEditandoId;
  auditoriaEditandoId = null;
  abaAuditoria = 'visualizacao';
  if (typeof toast === 'function') toast(eraEdicao ? 'Auditoria atualizada com sucesso.' : 'Auditoria cadastrada com sucesso.', 'valido');
  render();
}

function renderFormularioAuditoria() {
  const editando = auditoriaEditandoId ? auditoriasLista.find(a => a.id === auditoriaEditandoId) : null;
  const unidadesExtras = auditoriasLista.map(a => a.unidadeResponsavel).filter(Boolean);
  const unidadesConhecidas = new Set([
    ...unidadesExtras,
    ...(typeof SETORES_CONVIDADOS === 'object' && SETORES_CONVIDADOS ? Object.keys(SETORES_CONVIDADOS) : [])
  ]);
  const unidadeAtual = editando?.unidadeResponsavel || '';
  const unidadeNaLista = !unidadeAtual || unidadesConhecidas.has(unidadeAtual);
  const opcoesUnidades = typeof construirOptionsSetoresAgrupados === 'function'
    ? construirOptionsSetoresAgrupados(unidadeAtual, {
      placeholder: 'Selecione a unidade responsável',
      extras: unidadesExtras,
      incluirOutra: true
    })
    : `<option value="">Selecione a unidade responsável</option>${[...unidadesConhecidas].sort((a, b) => a.localeCompare(b, 'pt-BR')).map(u => `<option value="${escapeHtml(u)}" ${unidadeAtual === u ? 'selected' : ''}>${escapeHtml(u)}</option>`).join('')}<option value="__OUTRA__" ${!unidadeNaLista ? 'selected' : ''}>Outra unidade...</option>`;
  const hoje = new Date().toISOString().slice(0, 10);

  return `
    <section class="card auditoria-form-card">
      <div class="auditoria-form-head">
        <div>
          <h3>${editando ? 'Editar recomendação de auditoria' : 'Cadastrar nova auditoria / recomendação'}</h3>
          <p class="muted">Preencha os dados da auditoria e da recomendação para acompanhar o cumprimento.</p>
        </div>
      </div>
      <form id="form-acompanhamento-auditoria" class="auditoria-form" onsubmit="salvarFormularioAuditoria(event)">
        <div class="auditoria-grid-2">
          <div class="auditoria-field">
            <label for="aud-processo-sei">Processo SEI <span class="required-mark">*</span></label>
            <input id="aud-processo-sei" type="text" inputmode="numeric" maxlength="25" pattern="[0-9]{7}-[0-9]{2}\\.[0-9]{4}\\.[0-9]\\.[0-9]{2}\\.[0-9]{4}" placeholder="0000026-23.2020.6.01.8000" title="Digite os 13 primeiros algarismos; .6.01.8000 é preenchido automaticamente" value="${escapeHtml(editando?.processoSei || '')}" oninput="atualizarProcessoSeiAuditoria(this)" onchange="preencherAssuntoPorProcessoAuditoria(this.value)" required>
          </div>
          <div class="auditoria-field">
            <label for="aud-unidade">Unidade Responsável <span class="required-mark">*</span></label>
            <select id="aud-unidade" onchange="alternarOutraUnidadeAuditoria(this.value)" required>
              ${opcoesUnidades}
            </select>
            <div id="aud-unidade-outra-wrap" style="margin-top:6px" ${unidadeNaLista ? 'hidden' : ''}>
              <input id="aud-unidade-outra" type="text" maxlength="120" placeholder="Informe a unidade responsável" value="${escapeHtml(!unidadeNaLista ? unidadeAtual : '')}" ${!unidadeNaLista ? 'required' : ''}>
            </div>
          </div>
        </div>

        <div class="auditoria-field">
          <label for="aud-assunto">Assunto <span class="required-mark">*</span></label>
          <input id="aud-assunto" type="text" maxlength="400" placeholder="Ex.: Auditoria Integrada no Processo de Gestão de Infraestrutura de TIC" value="${escapeHtml(editando?.assunto || '')}" required>
        </div>

        <div class="auditoria-grid-3">
          <div class="auditoria-field">
            <label for="aud-num-achado">Nº Achado <span class="required-mark">*</span></label>
            <input id="aud-num-achado" type="text" maxlength="30" placeholder="Ex.: 1" value="${escapeHtml(editando?.numeroAchado || '')}" required>
          </div>
          <div class="auditoria-field">
            <label for="aud-num-rec">Nº Recomendação <span class="required-mark">*</span></label>
            <input id="aud-num-rec" type="text" maxlength="30" placeholder="Ex.: 1.1" value="${escapeHtml(editando?.numeroRecomendacao || '')}" required>
          </div>
          <div class="auditoria-field">
            <label for="aud-inicio">Início do Acompanhamento <span class="required-mark">*</span></label>
            <input id="aud-inicio" type="date" min="1900-01-01" max="9999-12-31" value="${escapeHtml(editando?.inicioAcompanhamento || hoje)}" required>
          </div>
        </div>

        <div class="auditoria-field">
          <label for="aud-status">Status <span class="required-mark">*</span></label>
          <select id="aud-status" required>
            <option value="Não implementada" ${(!editando || editando.status === 'Não implementada') ? 'selected' : ''}>Não implementada</option>
            <option value="Em implementação" ${editando?.status === 'Em implementação' ? 'selected' : ''}>Em implementação</option>
            <option value="Implementada" ${editando?.status === 'Implementada' ? 'selected' : ''}>Implementada</option>
          </select>
        </div>

        <div class="auditoria-field">
          <label for="aud-desc-achado">Descrição do Achado <span class="required-mark">*</span></label>
          <textarea id="aud-desc-achado" rows="3" maxlength="2000" placeholder="Descreva o achado identificado na auditoria..." required>${escapeHtml(editando?.descricaoAchado || '')}</textarea>
        </div>

        <div class="auditoria-field">
          <label for="aud-desc-rec">Descrição da Recomendação <span class="required-mark">*</span></label>
          <textarea id="aud-desc-rec" rows="4" maxlength="4000" placeholder="Descreva a recomendação a ser cumprida..." required>${escapeHtml(editando?.descricaoRecomendacao || '')}</textarea>
        </div>

        <div class="auditoria-form-actions">
          <button type="button" class="secondary" onclick="trocarAbaAuditoria('visualizacao')">Cancelar</button>
          <button type="submit" class="primary" id="btn-salvar-auditoria">${editando ? 'Salvar alterações' : 'Cadastrar auditoria'}</button>
        </div>
      </form>
    </section>
  `;
}

function renderVisualizacaoAuditorias() {
  const filtradas = obterAuditoriasFiltradas();
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / AUDITORIA_ITENS_POR_PAGINA));
  if (paginaAuditoria > totalPaginas) paginaAuditoria = totalPaginas;
  if (paginaAuditoria < 1) paginaAuditoria = 1;
  const inicioIdx = (paginaAuditoria - 1) * AUDITORIA_ITENS_POR_PAGINA;
  const paginaItens = filtradas.slice(inicioIdx, inicioIdx + AUDITORIA_ITENS_POR_PAGINA);
  const exibindoDe = filtradas.length ? inicioIdx + 1 : 0;
  const exibindoAte = Math.min(inicioIdx + AUDITORIA_ITENS_POR_PAGINA, filtradas.length);

  const unidades = [...new Set(auditoriasLista.map(a => a.unidadeResponsavel).filter(Boolean))].sort();
  const processos = [...new Set(auditoriasLista.map(a => a.processoSei).filter(Boolean))].sort();

  const botoesPaginacao = totalPaginas > 1 ? `
    <div class="paginacao" id="auditoria-paginacao" role="navigation" aria-label="Paginação de auditorias">
      <button type="button" class="pagina-btn pagina-seta" ${paginaAuditoria <= 1 ? 'disabled' : ''} onclick="irPaginaAuditoria(${paginaAuditoria - 1})">Anterior</button>
      ${Array.from({ length: totalPaginas }, (_, idx) => {
        const num = idx + 1;
        return `<button type="button" class="pagina-btn ${num === paginaAuditoria ? 'active' : ''}" ${num === paginaAuditoria ? 'aria-current="page"' : ''} onclick="irPaginaAuditoria(${num})">${num}</button>`;
      }).join('')}
      <button type="button" class="pagina-btn pagina-seta" ${paginaAuditoria >= totalPaginas ? 'disabled' : ''} onclick="irPaginaAuditoria(${paginaAuditoria + 1})">Próximo</button>
    </div>
  ` : '';

  return `
    <section class="card auditoria-filtros-card">
      <div class="auditoria-filtros-grid">
        <div class="auditoria-field">
          <label for="auditoria-busca">Buscar</label>
          <input id="auditoria-busca" type="search" maxlength="120" placeholder="Processo SEI, assunto, achado ou recomendação..." value="${escapeHtml(filtroAuditoriaBusca)}" oninput="atualizarBuscaAuditoria(this.value)">
        </div>
        <div class="auditoria-field">
          <label for="auditoria-filtro-processo">Processo SEI</label>
          <select id="auditoria-filtro-processo" onchange="filtroAuditoriaProcesso=this.value;paginaAuditoria=1;render()">
            <option value="">Todos os processos</option>
            ${processos.map(p => `<option value="${escapeHtml(p)}" ${filtroAuditoriaProcesso === p ? 'selected' : ''}>${escapeHtml(p)}</option>`).join('')}
          </select>
        </div>
        <div class="auditoria-field">
          <label for="auditoria-filtro-unidade">Unidade Responsável</label>
          <select id="auditoria-filtro-unidade" onchange="filtroAuditoriaUnidade=this.value;paginaAuditoria=1;render()">
            <option value="">Todas as unidades</option>
            ${unidades.map(u => `<option value="${escapeHtml(u)}" ${filtroAuditoriaUnidade === u ? 'selected' : ''}>${escapeHtml(typeof formatarRotuloSetor === 'function' ? formatarRotuloSetor(u) : u)}</option>`).join('')}
          </select>
        </div>
        <div class="auditoria-field">
          <label for="auditoria-filtro-status">Status</label>
          <select id="auditoria-filtro-status" onchange="filtroAuditoriaStatus=this.value;paginaAuditoria=1;render()">
            <option value="">Todos</option>
            <option value="Não implementada" ${filtroAuditoriaStatus === 'Não implementada' ? 'selected' : ''}>Não implementada</option>
            <option value="Em implementação" ${filtroAuditoriaStatus === 'Em implementação' ? 'selected' : ''}>Em implementação</option>
            <option value="Implementada" ${filtroAuditoriaStatus === 'Implementada' ? 'selected' : ''}>Implementada</option>
          </select>
        </div>
        <div class="auditoria-filtros-limpar">
          <button type="button" class="secondary" onclick="limparFiltrosAuditoria()">Limpar filtros</button>
        </div>
      </div>
    </section>

    <section class="card auditoria-tabela-card">
      <div class="auditoria-tabela-topo">
        <div>
          <h3>Recomendações de Auditoria</h3>
          <p class="muted" id="auditoria-total-texto">${filtradas.length ? `Mostrando ${exibindoDe}–${exibindoAte} de ${filtradas.length} ${filtradas.length === 1 ? 'registro' : 'registros'}` : '0 registros'}</p>
        </div>
      </div>
      <div class="auditoria-tabela-wrap">
        ${paginaItens.length ? `
          <table class="auditoria-acompanhamento-tabela">
            <thead>
              <tr>
                <th>Processo SEI / Assunto</th>
                <th>Achado</th>
                <th>Recomendação</th>
                <th>Unidade Resp.</th>
                <th>Status</th>
                <th>Início</th>
                <th>Tempo aguardando</th>
                <th style="text-align:right">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${paginaItens.map(item => `
                <tr>
                  <td class="col-processo">
                    <strong>${escapeHtml(item.processoSei)}</strong>
                    <small title="${escapeHtml(item.assunto)}">${escapeHtml(item.assunto)}</small>
                  </td>
                  <td class="col-achado">
                    <span class="auditoria-num-tag">Achado ${escapeHtml(item.numeroAchado)}</span>
                    <p title="${escapeHtml(item.descricaoAchado)}">${escapeHtml(item.descricaoAchado)}</p>
                  </td>
                  <td class="col-recomendacao">
                    <span class="auditoria-num-tag rec">Rec. ${escapeHtml(item.numeroRecomendacao)}</span>
                    <p title="${escapeHtml(item.descricaoRecomendacao)}">${escapeHtml(item.descricaoRecomendacao)}</p>
                  </td>
                  <td class="col-unidade"><strong>${escapeHtml(item.unidadeResponsavel)}</strong></td>
                  <td class="col-status">
                    <span class="auditoria-status-badge ${classeStatusAuditoria(item.status)}">${escapeHtml(item.status)}</span>
                  </td>
                  <td class="col-inicio">${escapeHtml(formatarDataAuditoria(item.inicioAcompanhamento))}</td>
                  <td class="col-tempo">${escapeHtml(calcularTempoAguardandoAuditoria(item.inicioAcompanhamento, item.status))}</td>
                  <td class="col-acoes">
                    <div class="auditoria-row-actions">
                      <button type="button" class="secondary" onclick="visualizarDetalhesAuditoria(${argumentoJsHtml(item.id)})">Ver</button>
                      <button type="button" class="secondary" onclick="editarAuditoria(${argumentoJsHtml(item.id)})">Editar</button>
                      <button type="button" class="secondary danger" onclick="excluirAuditoria(${argumentoJsHtml(item.id)})">Excluir</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<div class="empty-state"><h3>Nenhuma recomendação encontrada</h3><p>Ajuste os filtros ou cadastre uma nova auditoria.</p></div>'}
      </div>
      <div class="paginacao-rodape">
        <div class="paginacao-total-texto">Página ${paginaAuditoria} de ${totalPaginas}</div>
        ${botoesPaginacao}
      </div>
    </section>
  `;
}

function painelAcompanhamentoAuditoria() {
  if (!auditoriasCarregadas) {
    auditoriasLista = carregarAuditoriasLocal();
    auditoriasCarregadas = true;
    carregarAuditorias().then(() => {
      if (typeof page !== 'undefined' && page === 'auditorias') render();
    });
  }
  return `
    <div class="auditoria-modulo">
      <div class="auditoria-tabs" role="tablist" aria-label="Seções do acompanhamento de auditoria">
        <button type="button" role="tab" aria-selected="${abaAuditoria === 'visualizacao'}" class="secondary ${abaAuditoria === 'visualizacao' ? 'active' : ''}" onclick="trocarAbaAuditoria('visualizacao')">Visualização</button>
        <button type="button" role="tab" aria-selected="${abaAuditoria === 'cadastro'}" class="secondary ${abaAuditoria === 'cadastro' ? 'active' : ''}" onclick="trocarAbaAuditoria('cadastro')">${auditoriaEditandoId ? 'Editar auditoria' : 'Cadastrar auditoria'}</button>
      </div>
      ${abaAuditoria === 'cadastro' ? renderFormularioAuditoria() : renderVisualizacaoAuditorias()}
    </div>
  `;
}
