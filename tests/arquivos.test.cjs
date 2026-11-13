const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
for (const file of ['index.html','normativos.html','farol.html','dist/prototipo-normatic.html','dist/prototipo-documentos.html','dist/prototipo-farol.html']) {
  const html = fs.readFileSync(path.join(root,file),'utf8');
  const dom = new JSDOM(html), document = dom.window.document;
  const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
  assert.equal(new Set(ids).size,ids.length, 'IDs únicos em ' + file);
  for (const element of document.querySelectorAll('[src],link[href],a[href]')) {
    const ref = element.getAttribute('src') || element.getAttribute('href');
    if (!ref || /^(#|https?:|data:|mailto:|javascript:)/.test(ref)) continue;
    assert.ok(fs.existsSync(path.resolve(root,path.dirname(file),ref.split('#')[0])), file + ': ' + ref);
  }
  if (file.startsWith('dist/')) assert.equal(document.querySelectorAll('script[src],link[rel=stylesheet]').length, 0);
  dom.window.close();
}
for (const file of fs.readdirSync(path.join(root,'css')).filter(f => f.endsWith('.css'))) {
  const css = fs.readFileSync(path.join(root,'css',file),'utf8');
  for (const match of css.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) {
    if (/^(https?:|data:|#)/.test(match[1])) continue;
    assert.ok(fs.existsSync(path.resolve(root,'css',match[1])), file + ': ' + match[1]);
  }
}
console.log('Arquivos: recursos locais, IDs únicos e versões com recursos embutidos verificados.');
