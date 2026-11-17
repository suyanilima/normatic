/* Carrega os motores existentes somente após a autorização, sem fallback local no modo equipe. */
window.NORMATIC_READY=(async()=>{
  if(document.readyState==='loading') await new Promise(resolve=>document.addEventListener('DOMContentLoaded',resolve,{once:true}));
  if(NormaticCloud.enabled) document.documentElement.classList.add('cloud-locked');
  await NormaticAccess.authorize();
  const carregamentos=[];
  for(const source of document.querySelectorAll('script[data-app-src],script[data-app-inline]')) {
    const script=document.createElement('script');
    if(source.dataset.appSrc) {
      script.src=source.dataset.appSrc;
      script.async=false;
      carregamentos.push(new Promise((resolve,reject)=>{script.onload=resolve;script.onerror=()=>reject(Error('Não foi possível carregar a aplicação. Atualize a página.'));}));
      document.body.appendChild(script);
    } else {script.textContent=source.textContent;document.body.appendChild(script);}
  }
  await Promise.all(carregamentos);
  document.dispatchEvent(new Event('DOMContentLoaded'));
  NormaticAccess.toolbar();
  document.documentElement.classList.remove('cloud-locked');
  dispatchEvent(new Event('normatic:ready'));
})().catch(error=>{
  const failure=document.createElement('p');failure.className='cloud-boot-error';failure.textContent=error.message || 'Não foi possível abrir a plataforma.';document.body.appendChild(failure);
  throw error;
});
