(function(global) {
  'use strict';
  async function ensure(client) {
    const assurance = await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance.error) throw assurance.error;
    if (assurance.data.currentLevel === 'aal2') return;
    const result = await client.auth.mfa.listFactors();
    if (result.error) throw result.error;
    const factors = (result.data.totp || []).filter(factor => factor.status === 'verified');
    let enrollment;
    if (!factors.length) {
      // Fatores abandonados nunca foram confirmados; não remover fatores ativos.
      for (const factor of result.data.all || []) {
        if (factor.factor_type === 'totp' && factor.status === 'unverified') {
          const removed = await client.auth.mfa.unenroll({factorId: factor.id});
          if (removed.error) throw removed.error;
        }
      }
      const enrolled = await client.auth.mfa.enroll({factorType: 'totp', issuer: 'Normatic'});
      if (enrolled.error) throw enrolled.error;
      enrollment = enrolled.data;
    }
    const panel = document.createElement('section');
    panel.className = 'cloud-login cloud-mfa';
    panel.innerHTML = '<form class="cloud-login-card"><img class="cloud-login-logo" src="assets/normatic-logo.png" alt="Normatic"><span class="cloud-login-line" aria-hidden="true"></span><h1>Verificação em duas etapas</h1><p data-mfa-help></p><div data-mfa-setup></div><label for="cloud-factor">Aplicativo cadastrado</label><select id="cloud-factor"></select><label for="cloud-code">Código de 6 dígitos</label><input id="cloud-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required><p class="cloud-access-message" role="status" aria-live="polite"></p><button class="cloud-login-submit" type="submit">Verificar e entrar</button><button type="button" class="cloud-mfa-exit">Voltar ao login</button></form>';
    const select = panel.querySelector('select');
    panel.querySelector('[data-mfa-help]').textContent = enrollment
      ? 'No seu aplicativo autenticador, adicione uma conta pelo QR code ou pela chave abaixo. Depois, informe o código gerado para confirmar.'
      : 'Abra seu aplicativo autenticador e informe o código da sua conta Normatic.';
    if (enrollment) {
      const setup = panel.querySelector('[data-mfa-setup]');
      const image = document.createElement('img');
      image.alt = 'QR code para cadastrar o Normatic no aplicativo autenticador';
      const qr = enrollment.totp.qr_code;
      image.src = qr.startsWith('data:image/svg+xml') ? qr : 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(qr);
      const label = document.createElement('p'); label.textContent = 'Chave para cadastro manual (não compartilhe):';
      const secret = document.createElement('code'); secret.textContent = enrollment.totp.secret;
      setup.append(image, label, secret);
      select.add(new Option('Novo autenticador', enrollment.id));
    } else {
      factors.forEach((factor, index) => select.add(new Option(factor.friendly_name || 'Autenticador ' + (index + 1), factor.id)));
    }
    document.body.append(panel);
    panel.querySelector('input').focus();
    try {
      await new Promise((resolve, reject) => {
        let busy = false;
        const buttons = panel.querySelectorAll('button');
        const status = panel.querySelector('[role=status]');
        const form = panel.querySelector('form');
        form.addEventListener('submit', async event => {
          event.preventDefault(); if (busy) return;
          const input = panel.querySelector('input');
          if (!/^\d{6}$/.test(input.value)) { status.textContent = 'Informe os 6 dígitos do aplicativo.'; return; }
          busy = true; buttons.forEach(button => button.disabled = true); status.textContent = 'Verificando…';
          try {
            const verified = await client.auth.mfa.challengeAndVerify({factorId: select.value, code: input.value});
            input.value = '';
            if (verified.error) throw verified.error;
            const level = await client.auth.mfa.getAuthenticatorAssuranceLevel();
            if (level.error) throw level.error;
            if (level.data.currentLevel !== 'aal2') throw Error('Verificação não confirmada. Tente novamente.');
            resolve();
          } catch (error) {
            input.value = '';
            status.textContent = error.code === 'mfa_verification_failed' ? 'Código inválido ou expirado. Confira o aplicativo e tente novamente.' : (error.message || 'Não foi possível verificar. Tente novamente.');
            input.focus();
          } finally { busy = false; buttons.forEach(button => button.disabled = false); }
        });
        panel.querySelector('.cloud-mfa-exit').addEventListener('click', async () => {
          if (busy) return;
          busy = true; buttons.forEach(button => button.disabled = true);
          try {
            const signedOut = await client.auth.signOut({scope: 'local'});
            if (signedOut.error) throw signedOut.error;
            reject(Error('Entre novamente para continuar.'));
          } catch (error) { status.textContent = error.message; }
          finally { busy = false; buttons.forEach(button => button.disabled = false); }
        });
      });
    } finally {
      panel.remove(); // Remove também a chave e o QR code do DOM.
    }
  }
  global.NormaticMFA = {ensure};
})(globalThis);
