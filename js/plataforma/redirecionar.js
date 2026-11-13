const abaAntiga = location.hash.slice(1);
location.replace('index.html#' + (abaAntiga === 'cadastro' ? 'cadastro-reuniao' : abaAntiga || 'dashboard'));
