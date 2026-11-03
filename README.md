# Geeker — ЛР №8

Статичний сайт навчального клубу настільних ігор. За основу взято готовий лендинг ЛР №7. Цей репозиторій є окремою версією для роботи з Git і розгортання.

## Локальний перегляд

Запустіть `python -m http.server 5538` у корені репозиторію та відкрийте http://127.0.0.1:5538/. Tailwind CSS уже скомпільовано. Для карти, відео і погоди потрібен інтернет.

Перевірка локальних посилань: `python scripts/check_site.py` (Python 3.9 або новіший).

## Публікація

- GitHub Pages: Settings → Pages → Deploy from a branch → main → / (root).
- Netlify: Import an existing project → GitHub → цей репозиторій. Папку публікації задає netlify.toml; окрема збірка не потрібна.
- [Попередня версія ЛР №7 на Netlify](https://lab7sitesss.netlify.app/) зберігається окремо.
