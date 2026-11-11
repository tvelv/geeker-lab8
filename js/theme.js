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

    let wave;

    function changeTheme(theme) {
      apply(theme);
      syncToggle();
      try {
        localStorage.setItem(key, theme);
      } catch {
        // The switch still works on the current page if storage is disabled.
      }
    }

    syncToggle();
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      if (wave) return;
      const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
      if (!document.startViewTransition || !('pseudoElement' in KeyframeEffect.prototype)
          || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        changeTheme(nextTheme);
        return;
      }

      const button = toggle.getBoundingClientRect();
      const x = button.left + button.width / 2;
      const y = button.top + button.height / 2;
      const radius = Math.ceil(Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      ));
      root.classList.add('geeker-theme-wave');
      wave = document.startViewTransition(() => changeTheme(nextTheme));
      wave.ready.then(() => {
        root.animate([
          { clipPath: 'circle(0px at ' + x + 'px ' + y + 'px)' },
          { clipPath: 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)' }
        ], {
          duration: 640,
          easing: 'cubic-bezier(.24, .62, .25, 1)',
          pseudoElement: '::view-transition-new(root)'
        });
      }).catch(() => {});
      const clearWave = () => {
        root.classList.remove('geeker-theme-wave');
        wave = null;
      };
      wave.finished.then(clearWave, clearWave);
    });
    window.addEventListener('storage', (event) => {
      if (event.key !== key && event.key !== null) return;
      apply(event.newValue);
      syncToggle();
    });
  });
})();
