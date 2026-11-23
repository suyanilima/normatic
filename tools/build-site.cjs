const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist', 'site');
// Limpa o diretório de saída para evitar arquivos obsoletos ou duplicados.
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
// Publica somente os recursos usados pela aplicação, sem SQL, testes ou backups.
for (const name of ['index.html', 'normativos.html', 'farol.html', 'assets', 'css', 'js']) {
  fs.cpSync(path.join(root, name), path.join(output, name), { recursive: true });
}
console.log('Site preparado em dist/site');
