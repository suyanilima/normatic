const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const generated = path.join(root, 'dist');
fs.mkdirSync(generated, {recursive:true});
for (const [source, output] of [['normativos.html', 'prototipo-documentos.html'], ['index.html', 'prototipo-normatic.html'], ['farol.html', 'prototipo-farol.html']]) {
const sourcePath = path.join(root, source);
const outputPath = path.join(generated, output);

let html = fs.readFileSync(sourcePath, 'utf8');

html = html.replace(
  /<link\s+href="(assets\/[^"]+\.png)"\s+rel="icon"\s+type="image\/png"\s*\/>/g,
  (_, relativePath) => {
    const image = fs.readFileSync(path.join(root, relativePath)).toString('base64');
    return `<link href="data:image/png;base64,${image}" rel="icon" type="image/png"/>`;
  },
);

html = html.replace(
  /<img([^>]*?)\s+src="(assets\/[^"]+\.png)"([^>]*?)\/>/g,
  (_, before, relativePath, after) => {
    const image = fs.readFileSync(path.join(root, relativePath)).toString('base64');
    return `<img${before} src="data:image/png;base64,${image}"${after}/>`;
  },
);

html = html.replace(
  /<link\s+href="(css\/[^"]+\.css)"\s+rel="stylesheet"\s*\/>/g,
  (_, relativePath) => {
    let css = fs.readFileSync(path.join(root, relativePath), 'utf8');
    // Mantém o arquivo totalmente independente, sem baixar fontes externas.
    css = css.replace(/@import\s+url\(['"]https:\/\/fonts\.googleapis\.com\/[^)]*\);?\s*/g, '');
    css = css.replace(
      /url\((['"]?)(\.\.\/assets\/[^)'"]+\.svg)\1\)/g,
      (_, _quote, assetPath) => {
        const absoluteAssetPath = path.resolve(path.dirname(path.join(root, relativePath)), assetPath);
        const svg = fs.readFileSync(absoluteAssetPath).toString('base64');
        return `url("data:image/svg+xml;base64,${svg}")`;
      },
    );
    return `<style data-source="${relativePath}">\n${css}\n</style>`;
  },
);

html = html.replace(
  /<script type="text\/plain" data-app-src="(js\/[^"]+)"><\/script>/g,
  (_, relativePath) => `<script type="text/plain" data-app-inline="${relativePath}">\n${fs.readFileSync(path.join(root,relativePath),'utf8')}\n</script>`,
);

html = html.replace(
  /<script\s+src="(js\/[^"]+\.js)"><\/script>/g,
  (_, relativePath) => {
    const js = fs.readFileSync(path.join(root, relativePath), 'utf8');
    return `<script data-source="${relativePath}">\n${js}\n</script>`;
  },
);

if (/\b(?:href|src)="(?:assets|css|js)\//.test(html)) {
  throw new Error('Ainda existem dependências locais no HTML gerado.');
}

html = html.replaceAll('href="farol.html', 'href="prototipo-farol.html').replaceAll('href="index.html', 'href="prototipo-normatic.html');
html = html.replaceAll('`farol.html#', '`prototipo-farol.html#');
html = html.replaceAll("'index.html#", "'prototipo-normatic.html#");
if(source === 'index.html') {
  const documento = fs.readFileSync(path.join(generated,'prototipo-documentos.html')).toString('base64');
  html = html.replace('<template id="normativos-embutidos"></template>',`<template id="normativos-embutidos" data-srcdoc="${documento}"></template>`);
}
fs.writeFileSync(outputPath, html, 'utf8');
console.log(`Arquivo com recursos embutidos criado: ${outputPath}`);
}
