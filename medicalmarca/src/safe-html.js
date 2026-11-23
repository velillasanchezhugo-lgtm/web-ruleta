// Trusted Types: con la CSP «require-trusted-types-for 'script'» el navegador solo acepta HTML que pase por esta
// política. Todo el HTML de la web se genera con plantillas que escapan los datos (esc); aquí, además, se bloquea
// cualquier cosa que pueda ejecutar código, por si algún día entrara un dato sin escapar.
const DANGER = /<\s*(script|iframe|object|embed|link|meta|base|form)\b|\son[a-z]+\s*=|javascript:|data:text\/html/i;
const policy = window.trustedTypes?.createPolicy?.('mm-html', {
  createHTML(s) { if (DANGER.test(s)) throw new TypeError('HTML bloqueado por seguridad'); return s; },
});
export function setHTML(el, html) {
  if (policy) el.innerHTML = policy.createHTML(html);
  else if (DANGER.test(html)) throw new TypeError('HTML bloqueado por seguridad');
  else el.innerHTML = html;
}
