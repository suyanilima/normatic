(function(global) {
  const cloud=global.NormaticCloud;
  const AUTH_TIMEOUT=20000;
  const INACTIVITY_LIMIT_MS=4*60*60*1000; // 4 horas de inatividade
  const SESSION_CONTROL_KEY='normatic:cloud:session';
  const EXPIRY_NOTICE_KEY='normatic:cloud:expiry-notice';

  function hojeLocal() {
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function lerControleSessao() {
    try { return JSON.parse(global.localStorage?.getItem(SESSION_CONTROL_KEY) || 'null'); } catch(_) { return null; }
  }
  function salvarControleSessao(dados) {
    try { global.localStorage?.setItem(SESSION_CONTROL_KEY, JSON.stringify(dados)); } catch(_) {}
  }
  function limparControleSessao() {
    try { global.localStorage?.removeItem(SESSION_CONTROL_KEY); } catch(_) {}
  }
  function definirAvisoExpiracao(texto) {
    try { global.sessionStorage?.setItem(EXPIRY_NOTICE_KEY, texto); } catch(_) {}
  }
  function consumirAvisoExpiracao() {
    try {
      const msg=global.sessionStorage?.getItem(EXPIRY_NOTICE_KEY) || '';
      if(msg) global.sessionStorage?.removeItem(EXPIRY_NOTICE_KEY);
      return msg;
    } catch(_) { return ''; }
  }
  function sessaoInativa(ctrl, agora=Date.now()) {
    return Boolean(ctrl && typeof ctrl.lastActivity==='number' && (agora - ctrl.lastActivity) >= INACTIVITY_LIMIT_MS);
  }
  function registrarSessaoAtiva(userId, mfaDay) {
    salvarControleSessao({
      userId: userId || 'default',
      lastActivity: Date.now(),
      mfaDay: mfaDay || hojeLocal()
    });
  }
  function iniciarMonitorSessao(client, userId) {
    if(global._normaticMonitorSessaoAtivo) return;
    global._normaticMonitorSessaoAtivo=true;
    let ultimoRegistro=Date.now();

    const registrarAtividade=()=>{
      const agora=Date.now();
      if(agora - ultimoRegistro < 15000) return;
      ultimoRegistro=agora;
      const atual=lerControleSessao();
      if(atual && sessaoInativa(atual, agora)) { verificarExpiracao(); return; }
      salvarControleSessao({
        userId: userId || atual?.userId || 'default',
        lastActivity: agora,
        mfaDay: atual?.mfaDay || hojeLocal()
      });
    };

    const verificarExpiracao=async()=>{
      const atual=lerControleSessao();
      if(!atual) return;
      const agora=Date.now();
      if(sessaoInativa(atual, agora)) {
        limparControleSessao();
        definirAvisoExpiracao('Sua sessão expirou após 4 horas de inatividade. Entre novamente.');
        try { await client.auth.signOut({scope:'local'}); } catch(_) {}
        global.location?.reload?.();
        return;
      }
      if(atual.mfaDay && atual.mfaDay !== hojeLocal()) {
        global.location?.reload?.();
      }
    };

    ['pointerdown','keydown','scroll','touchstart','click'].forEach(ev=>{
      global.addEventListener?.(ev, registrarAtividade, {passive:true});
    });
    global.document?.addEventListener?.('visibilitychange', ()=>{
      if(global.document.visibilityState==='visible') verificarExpiracao();
    });
    const timer=global.setInterval?.(verificarExpiracao, 60000);
    if(timer && typeof timer.unref==='function') timer.unref();
  }
  function message(error) {
    if(error?.code==='PGRST202') return 'A equipe ainda não foi configurada. Peça ao administrador para concluir a configuração.';
    if(error?.name==='AbortError' || error?.name==='TimeoutError') return 'O servidor demorou para responder. Verifique sua conexão e tente novamente.';
    return error?.message || 'Não foi possível entrar. Confira os dados e tente novamente.';
  }
  function withTimeout(promise, ms) {
    return Promise.race([promise, new Promise((_,reject)=>{setTimeout(()=>reject(Object.assign(Error('Tempo limite excedido.'),{name:'TimeoutError'})),ms);})]);
  }
  async function authorize() {
    if(!cloud.enabled || cloud.ready) return;
    const client=cloud.database();
    document.documentElement.classList.add('cloud-locked');
    client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT' && cloud.ready) location.reload();});
    const {data,error}=await client.auth.getSession();
    let avisoInicial=consumirAvisoExpiracao();
    if(!error && data.session) {
      const userId=data.session.user?.id || 'default';
      const ctrl=lerControleSessao();
      if(ctrl && ctrl.userId===userId && sessaoInativa(ctrl)) {
        limparControleSessao();
        avisoInicial='Sua sessão expirou após 4 horas de inatividade. Entre novamente.';
        try { await client.auth.signOut({scope:'local'}); } catch(_) {}
      } else {
        const exigirMfaDiario=Boolean(ctrl && ctrl.userId===userId && ctrl.mfaDay && ctrl.mfaDay!==hojeLocal());
        try {
          await global.NormaticMFA.ensure(client, {forceChallenge: exigirMfaDiario});
          registrarSessaoAtiva(userId, hojeLocal());
          await withTimeout(cloud.reload(),AUTH_TIMEOUT);
          await withTimeout(cloud.registerAccess(),AUTH_TIMEOUT);
          iniciarMonitorSessao(client, userId);
          return;
        } catch(_) { /* Exibe o formulário para trocar de conta ou tentar novamente. */ }
      }
    }
    document.documentElement.classList.add('cloud-locked');
    const panel=document.createElement('section'); panel.className='cloud-login';
    panel.innerHTML=`<form class="cloud-login-card"><img class="cloud-login-logo" src="assets/normatic-logo.png" alt="Normatic"><span class="cloud-login-line" aria-hidden="true"></span><h1>Acessar o Sistema</h1><p>Informe seus dados para continuar</p><label for="cloud-email">E-mail</label><div class="cloud-input"><input id="cloud-email" name="email" type="email" autocomplete="username" placeholder="Digite seu e-mail" required></div><label for="cloud-password">Senha</label><div class="cloud-input"><input id="cloud-password" name="password" type="password" autocomplete="current-password" placeholder="Digite sua senha" required><button class="cloud-password-toggle" type="button" aria-label="Mostrar senha" aria-pressed="false">Mostrar</button></div><p class="cloud-access-message" role="status" aria-live="polite"></p><button class="cloud-login-submit" type="submit">Entrar</button></form>`;
    document.body.appendChild(panel);
    if(avisoInicial) panel.querySelector('[role=status]').textContent=avisoInicial;
    panel.querySelector('.cloud-password-toggle').addEventListener('click',event=>{
      const input=panel.querySelector('[name=password]'), visible=input.type==='text';
      input.type=visible?'password':'text';event.currentTarget.setAttribute('aria-pressed',String(!visible));event.currentTarget.setAttribute('aria-label',visible?'Mostrar senha':'Ocultar senha');event.currentTarget.textContent=visible?'Mostrar':'Ocultar';
    });
    await new Promise(resolve=>{
      panel.querySelector('form').addEventListener('submit',async event=>{
        event.preventDefault();const button=panel.querySelector('button[type=submit]');if(button.disabled)return;
        const status=panel.querySelector('[role=status]');button.disabled=true;status.textContent='Entrando…';
        try {
          const res=await withTimeout(client.auth.signInWithPassword({email:panel.querySelector('[name=email]').value.trim(),password:panel.querySelector('[name=password]').value}),AUTH_TIMEOUT);
          panel.querySelector('[name=password]').value='';
          if(res.error) throw res.error;
          const userId=res.data?.session?.user?.id || res.data?.user?.id || 'default';
          status.textContent='Senha aceita. Verificando acesso à equipe…';
          panel.hidden=true;
          await global.NormaticMFA.ensure(client);
          registrarSessaoAtiva(userId, hojeLocal());
          panel.hidden=false;
          status.textContent='Carregando os dados da equipe…';
          await withTimeout(cloud.reload(),AUTH_TIMEOUT);await withTimeout(cloud.registerAccess(),AUTH_TIMEOUT);
          iniciarMonitorSessao(client, userId);
          panel.remove();resolve();
        } catch(error) {
          panel.hidden=false;
          status.textContent=message(error);
          limparControleSessao();
          // A senha pode ter criado uma sessão mesmo quando MFA ou a autorização falha.
          // Encerre-a para que a próxima tentativa comece de forma previsível.
          try { await client.auth.signOut({scope:'local'}); } catch(_) { /* Mantém a mensagem original. */ }
        }
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
          limparControleSessao();
          const {error}=await cloud.database().auth.signOut();if(error)throw error;
          location.reload();return;
        }
      } catch(error) {status.textContent=message(error);}
      finally {button.disabled=false;}
    });
  }
  global.NormaticAccess={authorize,toolbar};
})(globalThis);
