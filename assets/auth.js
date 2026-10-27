// This is a browser-only UI gate. All files on GitHub Pages remain public.
(() => {
  const config = window.LIBER_LOGIN;
  const sessionKey = 'liber-blog-session';
  const isLoginPage = document.documentElement.dataset.loginPage === 'true';
  const signedIn = () => {
    try { return sessionStorage.getItem(sessionKey) === config.version; } catch { return false; }
  };
  const destination = () => {
    try {
      const url = new URL(new URLSearchParams(location.search).get('next') || '/', location.origin);
      if (url.origin !== location.origin || url.username || url.password || /^\/login(?:\/|$)/.test(url.pathname)) return '/';
      return url.pathname + url.search + url.hash;
    } catch { return '/'; }
  };
  const guard = () => {
    if (isLoginPage) return;
    if (signedIn()) document.documentElement.removeAttribute('data-auth-required');
    else {
      document.documentElement.setAttribute('data-auth-required', '');
      location.replace('/login/?next=' + encodeURIComponent(location.pathname + location.search + location.hash));
    }
  };
  guard();
  // Recheck when the browser restores a page from its back/forward cache.
  addEventListener('pageshow', guard);
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('[data-logout]')?.addEventListener('click', () => {
      try { sessionStorage.removeItem(sessionKey); } catch {}
      document.documentElement.setAttribute('data-auth-required', '');
      location.replace('/login/');
    });
    const form = document.querySelector('#login-form');
    if (!form) return;
    if (signedIn()) { location.replace(destination()); return; }
    const username = form.elements.username;
    const password = form.elements.password;
    const message = document.querySelector('#login-message');
    const toggle = document.querySelector('#toggle-password');
    toggle.addEventListener('click', () => {
      const show = password.type === 'password';
      password.type = show ? 'text' : 'password';
      toggle.textContent = show ? '隐藏' : '显示';
      toggle.setAttribute('aria-label', show ? '隐藏密码' : '显示密码');
      toggle.setAttribute('aria-pressed', String(show));
    });
    form.addEventListener('input', () => {
      message.textContent = '';
      username.removeAttribute('aria-invalid');
      password.removeAttribute('aria-invalid');
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const submit = form.querySelector('[type=submit]');
      submit.disabled = true;
      try {
        const bytes = new TextEncoder().encode(`${config.salt}:${password.value}`);
        const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(byte => byte.toString(16).padStart(2, '0')).join('');
        if (username.value.trim() !== config.username || hash !== config.passwordHash) {
          message.textContent = '账号或密码不正确，请再试一次。';
          username.setAttribute('aria-invalid', 'true');
          password.setAttribute('aria-invalid', 'true');
          password.focus();
          return;
        }
        sessionStorage.setItem(sessionKey, config.version);
        location.replace(destination());
      } catch {
        message.textContent = '暂时无法登录，请使用 HTTPS 访问，并允许浏览器保存当前标签页会话。';
      } finally { submit.disabled = false; }
    });
    username.focus({ preventScroll: true });
  });
})();
