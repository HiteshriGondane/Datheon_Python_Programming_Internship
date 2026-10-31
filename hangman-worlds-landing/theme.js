(() => {
  const key = 'hangmanTheme';
  const apply = theme => {
    document.documentElement.dataset.theme = theme;
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      const light = theme === 'light';
      toggle.setAttribute('aria-pressed', String(light));
      toggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
      const icon = toggle.querySelector('[data-theme-icon]');
      const label = toggle.querySelector('[data-theme-label]');
      if (icon) icon.textContent = light ? '☀' : '☾';
      if (label) label.textContent = light ? 'LIGHT' : 'DARK';
    }
  };
  apply(localStorage.getItem(key) === 'light' ? 'light' : 'dark');
  document.addEventListener('DOMContentLoaded', () => {
    apply(localStorage.getItem(key) === 'light' ? 'light' : 'dark');
    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem(key, next);
      apply(next);
    });
  });
})();
