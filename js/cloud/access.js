(function(global) {
  const cloud=global.NormaticCloud;
  function message(error) {
    if(error?.code==='PGRST202') return 'A equipe ainda não foi configurada. Peça ao administrador para concluir a configuração.';
    return error?.message || 'Não foi possível entrar. Confira os dados e tente novamente.';
  }
  async function authorize() {
    if(!cloud.enabled || cloud.ready) return;
    const client=cloud.database();
    document.documentElement.classList.add('cloud-locked');
    client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT' && cloud.ready) location.reload();});
    const {data,error}=await client.auth.getSession();
    if(!error && data.session) {
      try { await global.NormaticMFA.ensure(client); await cloud.reload(); return; } catch(_) { /* Exibe o formulário para trocar de conta ou tentar novamente. */ }
    }
    document.documentElement.classList.add('cloud-locked');
    const panel=document.createElement('section'); panel.className='cloud-login';
    panel.innerHTML=`<form class="cloud-login-card"><h1>Normatic</h1><h2>Acesso da equipe</h2><p>Entre com a conta autorizada para consultar os registros compartilhados.</p><label for="cloud-email">E-mail</label><input id="cloud-email" name="email" type="email" autocomplete="username" required><label for="cloud-password">Senha</label><input id="cloud-password" name="password" type="password" autocomplete="current-password" required><p class="cloud-access-message" role="status" aria-live="polite"></p><button type="submit">Entrar</button></form>`;
    document.body.appendChild(panel);
    await new Promise(resolve=>{
      panel.querySelector('form').addEventListener('submit',async event=>{
        event.preventDefault();const button=panel.querySelector('button');if(button.disabled)return;
        const status=panel.querySelector('[role=status]');button.disabled=true;status.textContent='Entrando…';
        try {
          const {error}=await client.auth.signInWithPassword({email:panel.querySelector('[name=email]').value.trim(),password:panel.querySelector('[name=password]').value});
          panel.querySelector('[name=password]').value='';
          if(error) throw error;
          await global.NormaticMFA.ensure(client);
          await cloud.reload();panel.remove();resolve();
        } catch(error) { status.textContent=message(error); }
        finally {button.disabled=false;}
      });
    });
  }
  function toolbar() {
    if(!cloud.enabled || global.parent!==global) return;
    const bar=document.createElement('section');bar.className='cloud-toolbar';
    bar.innerHTML='<span>Dados da equipe</span><button type="button" data-cloud-action="refresh">Atualizar dados</button><button type="button" data-cloud-action="backup">Baixar backup local</button><button type="button" data-cloud-action="import">Importar dados deste navegador</button><button type="button" data-cloud-action="logout">Sair</button><span role="status" aria-live="polite"></span>';
    (document.querySelector('main') || document.body).prepend(bar);
    global.addEventListener('normatic:cloud-saving',event=>{
      document.documentElement.classList.toggle('cloud-saving',event.detail);
      document.querySelectorAll('main,.plataforma-sidebar').forEach(area=>{area.inert=event.detail;});
    });
    if(!['admin','editor'].includes(cloud.role)) bar.querySelector('[data-cloud-action=import]').disabled=true;
    bar.addEventListener('click',async event=>{
      const action=event.target.dataset.cloudAction;if(!action || event.target.disabled)return;
      const button=event.target,status=bar.querySelector('[role=status]');button.disabled=true;
      try {
        if(action==='logout') {
          const {error}=await cloud.database().auth.signOut();if(error)throw error;
          location.reload();return;
        }
        if(action==='backup') {
          const data=await cloud.captureLocal();
          const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);
          const link=document.createElement('a');link.href=url;link.download='normatic-backup-local-'+new Date().toISOString().slice(0,10)+'.json';link.click();URL.revokeObjectURL(url);
          status.textContent='Backup local gerado.';return;
        }
        if(action==='import') {
          if(!confirm('Importar os dados deste navegador para a equipe? Essa ação só é permitida se o banco estiver vazio. Baixe um backup local antes de continuar.')) return;
          await cloud.importLocal();status.textContent='Dados importados. As cópias locais foram preservadas.';
        } else { await cloud.reload();status.textContent='Dados da equipe atualizados.'; }
        await global.refresh?.();global.carregarUnidades?.();global.carregarHistoricoMinutas?.();global.carregarReunioes?.();
        const frame=document.getElementById('normativos-frame');await frame?.contentWindow?.carregar?.();
      } catch(error) {status.textContent=message(error);}
      finally {button.disabled=false;}
    });
  }
  global.NormaticAccess={authorize,toolbar};
})(globalThis);
