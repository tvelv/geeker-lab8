(() => {
  const key = 'geeker-theme';
  const root = document.documentElement;
  const apply = (theme) => {
    root.dataset.theme = theme === 'light' ? 'light' : 'dark';
  };

  try {
    apply(localStorage.getItem(key));
  } catch {
    apply('dark');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;

    function syncToggle() {
      const light = root.dataset.theme === 'light';
      toggle.setAttribute('aria-checked', String(light));
      toggle.title = light ? 'Увімкнути темну тему' : 'Увімкнути світлу тему';
    }

    syncToggle();
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      apply(root.dataset.theme === 'light' ? 'dark' : 'light');
      syncToggle();
      try {
        localStorage.setItem(key, root.dataset.theme);
      } catch {
        // The switch still works on the current page if storage is disabled.
      }
    });
    window.addEventListener('storage', (event) => {
      if (event.key !== key && event.key !== null) return;
      apply(event.newValue);
      syncToggle();
    });
  });
})();
