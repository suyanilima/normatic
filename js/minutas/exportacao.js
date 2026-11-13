/* ===== EXPORTAÇÃO DE MINUTAS E INICIALIZAÇÃO DO MÓDULO ===== */

function textoAtaParaHtml(valor){
  return escapeHtml(String(valor || '')).replace(/\r?\n/g, '<br>');
}

function gerarHtmlDocumentoAta(){
  const reuniao = obterReuniaoMinutaAtual();
  if(!reuniao) return '';
  const conteudoFinal = obterHtmlEditorMinuta('minuta-reuniao-texto');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Ata - PRESI/${escapeHtml(reuniao.frequencia)}</title><style>
    @page{size:A4 portrait;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0}body{color:#111;font-family:"Times New Roman",serif;font-size:12pt;line-height:1.4}.pagina{width:100%;margin:0 auto;padding:18mm 16mm}.conteudo{text-align:justify;overflow-wrap:anywhere}.ata-titulo{text-align:center;font-size:15pt;margin-bottom:18px}.ata-bloco{border:1px solid #777;padding:8px 10px;margin:0}.ata-bloco+.ata-bloco{border-top:0}.ata-secao-titulo{margin:0 0 5px}.ata-secao-conteudo{margin:0}.letras-compactas{letter-spacing:-.35pt}.texto-marcado,mark{background:#fff19a}.texto-menor{font-size:10pt}.texto-maior{font-size:15pt}table{width:100%;margin:7px 0;border-collapse:collapse}th,td{padding:6px;border:1px solid #777;vertical-align:top}ul{margin:6px 0;padding-left:24px}li{margin:3px 0}@media print{.pagina{padding:18mm 16mm}}
  </style></head><body><main class="pagina">
    <section class="conteudo">${conteudoFinal}</section>
  </main></body></html>`;
}

function escaparXmlAta(valor){
  return String(valor ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function crc32Ata(bytes){
  let crc = -1;
  for(const byte of bytes){
    crc ^= byte;
    for(let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ -1) >>> 0;
}

function criarDocxAta(arquivos){
  const encoder = new TextEncoder();
  const partes = [];
  const central = [];
  let deslocamento = 0;
  const inteiro16 = valor => new Uint8Array([valor & 255, (valor >>> 8) & 255]);
  const inteiro32 = valor => new Uint8Array([valor & 255, (valor >>> 8) & 255, (valor >>> 16) & 255, (valor >>> 24) & 255]);
  const juntar = itens => {
    const tamanho = itens.reduce((total, item) => total + item.length, 0);
    const resultado = new Uint8Array(tamanho);
    let posicao = 0;
    itens.forEach(item => { resultado.set(item, posicao); posicao += item.length; });
    return resultado;
  };
  Object.entries(arquivos).forEach(([nome, conteudo]) => {
    const nomeBytes = encoder.encode(nome);
    const dados = encoder.encode(conteudo);
    const crc = crc32Ata(dados);
    const local = juntar([inteiro32(0x04034b50), inteiro16(20), inteiro16(0x0800), inteiro16(0), inteiro16(0), inteiro16(0), inteiro32(crc), inteiro32(dados.length), inteiro32(dados.length), inteiro16(nomeBytes.length), inteiro16(0), nomeBytes, dados]);
    partes.push(local);
    central.push(juntar([inteiro32(0x02014b50), inteiro16(20), inteiro16(20), inteiro16(0x0800), inteiro16(0), inteiro16(0), inteiro16(0), inteiro32(crc), inteiro32(dados.length), inteiro32(dados.length), inteiro16(nomeBytes.length), inteiro16(0), inteiro16(0), inteiro16(0), inteiro16(0), inteiro32(0), inteiro32(deslocamento), nomeBytes]));
    deslocamento += local.length;
  });
  const diretorio = juntar(central);
  const fim = juntar([inteiro32(0x06054b50), inteiro16(0), inteiro16(0), inteiro16(central.length), inteiro16(central.length), inteiro32(diretorio.length), inteiro32(deslocamento), inteiro16(0)]);
  return new Blob([...partes, diretorio, fim], {type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
}

function gerarXmlDocumentoAta(){
  const tokens = obterTokensEditorMinuta('minuta-reuniao-texto');
  const largura = 10060;
  const run = token => {
    const propriedades = `${token.negrito ? '<w:b/>' : ''}${token.italico ? '<w:i/>' : ''}${token.sublinhado ? '<w:u w:val="single"/>' : ''}<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="${token.titulo ? 30 : token.menor ? 20 : token.maior ? 30 : 22}"/>`;
    return `<w:r><w:rPr>${propriedades}</w:rPr><w:t xml:space="preserve">${escaparXmlAta(token.texto)}</w:t></w:r>`;
  };
  const paragrafo = (conteudo = '', opcoes = {}) => `<w:p><w:pPr>${opcoes.centro ? '<w:jc w:val="center"/>' : ''}<w:spacing w:before="0" w:after="${opcoes.depois ?? 80}" w:line="276" w:lineRule="auto"/>${opcoes.lista ? '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>' : ''}</w:pPr>${conteudo}</w:p>`;
  const tabelaInterna = linhas => {
    const colunas = Math.max(1, ...linhas.map(linha => linha.length));
    const coluna = Math.floor((largura - 240) / colunas);
    const grade = Array.from({length:colunas}, () => `<w:gridCol w:w="${coluna}"/>`).join('');
    const corpo = linhas.map(linha => `<w:tr>${Array.from({length:colunas}, (_, indice) => {
      const celula = linha[indice] || {texto:'', cabecalho:false};
      return `<w:tc><w:tcPr><w:tcW w:w="${coluna}" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${paragrafo(run({texto:celula.texto, negrito:celula.cabecalho}), {depois:0})}</w:tc>`;
    }).join('')}</w:tr>`).join('');
    return `<w:tbl><w:tblPr><w:tblW w:w="${largura - 240}" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders></w:tblPr><w:tblGrid>${grade}</w:tblGrid>${corpo}</w:tbl>`;
  };
  let titulo = '';
  const blocos = [];
  let bloco = null;
  let linha = [];
  let lista = false;
  const fecharLinha = () => {
    if(!bloco || (!linha.length && bloco.length)) return;
    bloco.push(paragrafo(linha.join(''), {lista}));
    linha = [];
  };
  tokens.forEach(token => {
    if(token.inicioBloco){ bloco = []; linha = []; return; }
    if(token.fimBloco){ fecharLinha(); blocos.push(bloco || []); bloco = null; return; }
    if(token.tabela){ fecharLinha(); bloco?.push(tabelaInterna(token.tabela)); return; }
    if(token.inicioItem){ fecharLinha(); lista = true; return; }
    if(token.fimItem){ fecharLinha(); lista = false; return; }
    if(token.inicioTituloSecao || token.fimTituloSecao) return;
    if(token.titulo){
      if(String(token.texto || '').trim()) titulo += run({...token, texto:String(token.texto).trim()});
      return;
    }
    if(token.texto === undefined || !bloco) return;
    const partesTexto = String(token.texto).split('\n');
    partesTexto.forEach((parte, indice) => {
      if(parte) linha.push(run({...token, texto:parte}));
      if(indice < partesTexto.length - 1) fecharLinha();
    });
  });
  const linhasTabela = blocos.map(conteudo => `<w:tr><w:tc><w:tcPr><w:tcW w:w="${largura}" w:type="dxa"/><w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="150" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="150" w:type="dxa"/></w:tcMar></w:tcPr>${conteudo.join('')}</w:tc></w:tr>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragrafo(titulo, {centro:true, depois:240})}<w:tbl><w:tblPr><w:tblW w:w="${largura}" w:type="dxa"/><w:jc w:val="center"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="777777"/><w:left w:val="single" w:sz="4" w:color="777777"/><w:bottom w:val="single" w:sz="4" w:color="777777"/><w:right w:val="single" w:sz="4" w:color="777777"/><w:insideH w:val="single" w:sz="4" w:color="777777"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="${largura}"/></w:tblGrid>${linhasTabela}</w:tbl><w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1020" w:right="850" w:bottom="1020" w:left="850" w:header="425" w:footer="425" w:gutter="0"/></w:sectPr></w:body></w:document>`;
}

function baixarMinutaWord(){
  const reuniao = obterReuniaoMinutaAtual();
  if(!reuniao) return;
  const documento = gerarXmlDocumentoAta();
  const dataIso = new Date().toISOString();
  const blob = criarDocxAta({
    '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>',
    '_rels/.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>',
    'word/_rels/document.xml.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>',
    'word/document.xml':documento,
    'word/styles.xml':'<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="80" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style></w:styles>',
    'word/numbering.xml':'<?xml version="1.0" encoding="UTF-8"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:tabs><w:tab w:val="num" w:pos="540"/></w:tabs><w:ind w:left="540" w:hanging="270"/></w:pPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>',
    'docProps/core.xml':`<?xml version="1.0" encoding="UTF-8"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>Ata - PRESI/${escaparXmlAta(reuniao.frequencia)}</dc:title><dc:creator>NORMATIC</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${dataIso}</dcterms:created></cp:coreProperties>`,
    'docProps/app.xml':'<?xml version="1.0" encoding="UTF-8"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>NORMATIC</Application></Properties>'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ata-${reuniao.frequencia.toLowerCase()}-${reuniao.data}.docx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast('Arquivo DOCX gerado.', 'valido');
}

function imprimirMinutaPdf(){
  const reuniao = obterReuniaoMinutaAtual();
  const JsPdf = window.jspdf?.jsPDF;
  if(!reuniao || !JsPdf){
    toast('Não foi possível carregar o gerador de PDF.', 'vencido');
    return;
  }
  const doc = new JsPdf({orientation:'portrait', unit:'mm', format:'a4', compress:true});
  const margemX = 16;
  const largura = 178;
  const limiteY = 276;
  let y = 20;

  function novaPagina(){ doc.addPage(); y = 20; }
  function garantirEspaco(altura){ if(y + altura > limiteY) novaPagina(); }
  function escrever(texto, opcoes = {}){
    const tamanho = opcoes.tamanho || 11;
    const estilo = opcoes.negrito ? 'bold' : 'normal';
    doc.setFont('times', estilo);
    doc.setFontSize(tamanho);
    const linhas = doc.splitTextToSize(String(texto || ''), largura - (opcoes.recuo || 0));
    const alturaLinha = tamanho * .42;
    linhas.forEach(linha => {
      garantirEspaco(alturaLinha + 1);
      doc.text(linha, margemX + (opcoes.recuo || 0), y);
      y += alturaLinha;
    });
    y += opcoes.depois ?? 2;
  }
  function separador(){ garantirEspaco(4); doc.setDrawColor(150); doc.line(margemX, y, margemX + largura, y); y += 5; }
  function tituloSecao(titulo){ separador(); escrever(titulo.toUpperCase(), {negrito:true, tamanho:11, depois:3}); }
  function escreverEditor(id){
    const tokens = obterTokensEditorMinuta(id);
    const tamanho = 11;
    const alturaLinha = 4.8;
    let dentroBloco = false;
    let dentroItem = false;
    let inicioBloco = null;
    let x = margemX;
    function baseX(){ return margemX + (dentroBloco ? 3 : 0) + (dentroItem ? 5 : 0); }
    function maxX(){ return dentroBloco ? margemX + largura - 3 : margemX + largura; }
    function novaLinha(){ y += alturaLinha; x = baseX(); garantirEspaco(alturaLinha); }
    garantirEspaco(alturaLinha);
    tokens.forEach(token => {
      if(token.inicioTituloSecao){
        if(x > baseX()) novaLinha();
        return;
      }
      if(token.fimTituloSecao){
        y += 1.8;
        x = baseX();
        garantirEspaco(alturaLinha);
        return;
      }
      if(token.tabela){
        if(x > baseX()) novaLinha();
        const colunas = Math.max(...token.tabela.map(linha => linha.length));
        const larguraTabela = maxX() - baseX();
        const larguraCelula = larguraTabela / colunas;
        token.tabela.forEach(linha => {
          doc.setFontSize(9);
          const conteudos = Array.from({length:colunas}, (_, indice) => {
            const celula = linha[indice] || {texto:'',cabecalho:false};
            doc.setFont('times', celula.cabecalho ? 'bold' : 'normal');
            return {...celula, linhas:doc.splitTextToSize(celula.texto, larguraCelula - 4)};
          });
          const altura = Math.max(8, ...conteudos.map(celula => Math.max(1, celula.linhas.length) * 4 + 4));
          garantirEspaco(altura + 2);
          conteudos.forEach((celula, indice) => {
            const celulaX = baseX() + indice * larguraCelula;
            doc.setDrawColor(130);
            doc.rect(celulaX, y, larguraCelula, altura);
            doc.setFont('times', celula.cabecalho ? 'bold' : 'normal');
            doc.setFontSize(9);
            doc.text(celula.linhas, celulaX + 2, y + 4);
          });
          y += altura;
        });
        y += 4;
        x = baseX();
        return;
      }
      if(token.inicioBloco){
        garantirEspaco(12);
        dentroBloco = true;
        y += 5;
        x = baseX();
        inicioBloco = {pagina:doc.internal.getCurrentPageInfo().pageNumber, y:y - 5};
        return;
      }
      if(token.inicioItem){
        if(x > baseX()) novaLinha();
        dentroItem = true;
        x = baseX();
        doc.setFont('times', 'normal');
        doc.setFontSize(tamanho);
        doc.text('•', x - 4, y);
        return;
      }
      if(token.fimItem){
        dentroItem = false;
        y += alturaLinha;
        x = baseX();
        garantirEspaco(alturaLinha);
        return;
      }
      if(token.fimBloco){
        y += 4;
        const paginaAtual = doc.internal.getCurrentPageInfo().pageNumber;
        const paginaRetorno = paginaAtual;
        doc.setDrawColor(130);
        for(let pagina = inicioBloco.pagina; pagina <= paginaAtual; pagina++){
          doc.setPage(pagina);
          const topo = pagina === inicioBloco.pagina ? inicioBloco.y : 16;
          const fim = pagina === paginaAtual ? y : limiteY + 2;
          doc.rect(margemX, topo, largura, Math.max(4, fim - topo));
        }
        doc.setPage(paginaRetorno);
        dentroBloco = false;
        inicioBloco = null;
        x = margemX;
        return;
      }
      if(token.titulo && String(token.texto || '').trim()){
        garantirEspaco(8);
        doc.setFont('times', 'bold');
        doc.setFontSize(15);
        doc.text(String(token.texto).trim(), 105, y, {align:'center'});
        y += 10;
        x = margemX;
        return;
      }
      const partes = String(token.texto || '').split(/(\n|\s+)/).filter(parte => parte !== '');
      partes.forEach(parte => {
        if(parte.includes('\n')){ novaLinha(); return; }
        const estilo = token.negrito && token.italico ? 'bolditalic' : token.negrito ? 'bold' : token.italico ? 'italic' : 'normal';
        doc.setFont('times', estilo);
        doc.setFontSize(tamanho);
        doc.setCharSpace(token.compacto ? -.12 : 0);
        const larguraParte = doc.getTextWidth(parte);
        if(x > baseX() && x + larguraParte > maxX()) novaLinha();
        if(/^\s+$/.test(parte) && x === baseX()) return;
        const larguraDisponivel = maxX() - baseX();
        if(larguraParte > larguraDisponivel){
          doc.splitTextToSize(parte, larguraDisponivel).forEach((linha, indice) => {
            if(indice) novaLinha();
            doc.text(linha, x, y);
            if(token.sublinhado) doc.line(x, y + .7, x + doc.getTextWidth(linha), y + .7);
            x += doc.getTextWidth(linha);
          });
          return;
        }
        doc.text(parte, x, y);
        if(token.sublinhado && !/^\s+$/.test(parte)) doc.line(x, y + .7, x + larguraParte, y + .7);
        x += larguraParte;
      });
    });
    doc.setCharSpace(0);
    y += alturaLinha + 3;
  }

  escreverEditor('minuta-reuniao-texto');

  const totalPaginas = doc.getNumberOfPages();
  for(let pagina = 1; pagina <= totalPaginas; pagina++){
    doc.setPage(pagina);
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(90);
    doc.text(`${pagina}/${totalPaginas}`, 194, 291, {align:'right'});
  }
  doc.save(`ata-${reuniao.frequencia.toLowerCase()}-${reuniao.data}.pdf`);
  toast('PDF baixado com sucesso.', 'valido');
}

document.addEventListener('DOMContentLoaded', () => {
  carregarUnidades();
  montarPaginaMinuta();
  carregarHistoricoMinutas();
  carregarReunioes();
  renderParticipantesCadastro();
  atualizarContadorPauta();
  atualizarEstadoEdicaoReuniao();
  document.getElementById('r-participante-input')?.addEventListener('keydown', evento => {
    if(evento.key !== 'Enter') return;
    evento.preventDefault();
    adicionarParticipanteReuniao();
  });
  document.getElementById('edit-r-participante-input')?.addEventListener('keydown', evento => {
    if(evento.key !== 'Enter') return;
    evento.preventDefault();
    adicionarParticipanteEdicaoReuniao();
  });
});
