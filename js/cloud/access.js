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
      try { await global.NormaticMFA.ensure(client); await cloud.reload(); await cloud.registerAccess(); return; } catch(_) { /* Exibe o formulário para trocar de conta ou tentar novamente. */ }
    }
    document.documentElement.classList.add('cloud-locked');
    const panel=document.createElement('section'); panel.className='cloud-login';
    panel.innerHTML=`<form class="cloud-login-card"><img class="cloud-login-logo" src="assets/normatic-logo.png" alt="Normatic"><span class="cloud-login-line" aria-hidden="true"></span><h1>Acessar o Sistema</h1><p>Informe seus dados para continuar</p><label for="cloud-email">E-mail</label><div class="cloud-input"><input id="cloud-email" name="email" type="email" autocomplete="username" placeholder="Digite seu e-mail" required></div><label for="cloud-password">Senha</label><div class="cloud-input"><input id="cloud-password" name="password" type="password" autocomplete="current-password" placeholder="Digite sua senha" required><button class="cloud-password-toggle" type="button" aria-label="Mostrar senha" aria-pressed="false">Mostrar</button></div><p class="cloud-access-message" role="status" aria-live="polite"></p><button class="cloud-login-submit" type="submit">Entrar</button></form>`;
    document.body.appendChild(panel);
    panel.querySelector('.cloud-password-toggle').addEventListener('click',event=>{
      const input=panel.querySelector('[name=password]'), visible=input.type==='text';
      input.type=visible?'password':'text';event.currentTarget.setAttribute('aria-pressed',String(!visible));event.currentTarget.setAttribute('aria-label',visible?'Mostrar senha':'Ocultar senha');event.currentTarget.textContent=visible?'Mostrar':'Ocultar';
    });
    await new Promise(resolve=>{
      panel.querySelector('form').addEventListener('submit',async event=>{
        event.preventDefault();const button=panel.querySelector('button[type=submit]');if(button.disabled)return;
        const status=panel.querySelector('[role=status]');button.disabled=true;status.textContent='Entrando…';
        try {
          const {error}=await client.auth.signInWithPassword({email:panel.querySelector('[name=email]').value.trim(),password:panel.querySelector('[name=password]').value});
          panel.querySelector('[name=password]').value='';
          if(error) throw error;
          await global.NormaticMFA.ensure(client);
          await cloud.reload();await cloud.registerAccess();panel.remove();resolve();
        } catch(error) { status.textContent=message(error); }
        finally {button.disabled=false;}
      });
    });
  }
  function toolbar() {
    if(!cloud.enabled || global.parent!==global) return;
    const bar=document.createElement('section');bar.className='cloud-account';
    bar.innerHTML='<button type="button" data-cloud-action="logout">Sair</button><span role="status" aria-live="polite"></span>';
    (document.querySelector('.plataforma-sidebar') || document.body).append(bar);
    global.addEventListener('normatic:cloud-saving',event=>{
      document.documentElement.classList.toggle('cloud-saving',event.detail);
      document.querySelectorAll('main,.plataforma-sidebar').forEach(area=>{area.inert=event.detail;});
    });
    bar.addEventListener('click',async event=>{
      const action=event.target.dataset.cloudAction;if(!action || event.target.disabled)return;
      const button=event.target,status=bar.querySelector('[role=status]');button.disabled=true;
      try {
        if(action==='logout') {
          const {error}=await cloud.database().auth.signOut();if(error)throw error;
          location.reload();return;
        }
      } catch(error) {status.textContent=message(error);}
      finally {button.disabled=false;}
    });
  }
  global.NormaticAccess={authorize,toolbar};
})(globalThis);
