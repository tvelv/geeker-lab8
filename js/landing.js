/* Live weather and local evening planning; no booking data is transmitted. */
const weatherStatus = document.querySelector('#weather-status');
const weatherValue = document.querySelector('#weather-value');
const retry = document.querySelector('#weather-retry');
async function updateWeather() {
  retry.disabled = true;
  weatherStatus.textContent = 'Завантажуємо поточні дані…';
  weatherValue.textContent = '—';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=49.84&longitude=24.03&current=temperature_2m,weather_code&timezone=Europe%2FKyiv', { signal: controller.signal });
    if (!response.ok) throw new Error('Weather unavailable');
    const data = await response.json();
    const current = data.current;
    if (!Number.isFinite(current?.temperature_2m) || !Number.isFinite(current?.weather_code) || typeof current?.time !== 'string') throw new Error('Invalid data');
    const code = current.weather_code;
    const description = code === 0 ? 'Ясно' : code <= 3 ? 'Мінлива хмарність' : code <= 48 ? 'Туман' : code <= 67 ? 'Дощ' : code <= 77 ? 'Сніг' : code <= 82 ? 'Зливи' : code <= 86 ? 'Снігові зливи' : 'Гроза';
    weatherValue.textContent = `${Math.round(current.temperature_2m)} °C`;
    weatherStatus.textContent = `${description}. Дані на ${current.time.slice(11,16)} за Києвом.`;
  } catch {
    weatherStatus.textContent = 'Не вдалося отримати погоду. Спробуйте оновити пізніше.';
  } finally { clearTimeout(timeout); retry.disabled = false; }
}
retry.addEventListener('click', updateWeather);
// Defer API work until the informer is near the viewport.
if ('IntersectionObserver' in window) {
 const observer = new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); updateWeather(); }
 }, { rootMargin: '200px' });
 observer.observe(weatherStatus);
} else updateWeather();
const form = document.querySelector('#evening-plan');
const result = document.querySelector('#plan-result');
const copy = document.querySelector('#copy-plan');
form.addEventListener('submit', event => {
 event.preventDefault();
 const games = { 'Асоціації та уява': 'Dixit', 'Стратегічні рішення': 'Крила', 'Командна взаємодія': 'Mysterium' };
 const choice = form.elements.mood.value;
 const selected = games[choice];
 const pairNote = form.elements.players.value === '2' && selected !== 'Крила' ? ' Ця гра потребує щонайменше 3 учасників. Запросіть ще одного гравця або оберіть у каталозі гру для двох.' : '';
 const extra = form.elements.players.value === '5–6' && selected === 'Крила' ? ' Для 6 гравців оберіть інший формат або кілька столів; базова гра «Крила» розрахована на 1–5.' : '';
 result.textContent = `Мій план: ${form.elements.players.value} гравці; ${choice.toLocaleLowerCase('uk')}. Початкова ідея — ${selected}.${pairNote}${extra} Перед зустріччю погодити з клубом дату, адресу, місця й вартість. Це не підтверджене бронювання.`;
 result.hidden = false; copy.hidden = false; copy.textContent = 'Скопіювати план';
});
form.addEventListener('change', () => { result.hidden = true; copy.hidden = true; });
copy.addEventListener('click', async () => {
 try { await navigator.clipboard.writeText(result.textContent); copy.textContent = 'План скопійовано'; }
 catch { copy.textContent = 'Виділіть і скопіюйте текст плану вручну'; }
});
document.querySelectorAll('header details a').forEach(link => link.addEventListener('click', () => link.closest('details').open = false));

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const cardObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-revealed');
      cardObserver.unobserve(entry.target);
    }
  }, { threshold: 0.2 });

  document.querySelectorAll('#benefits article, #services article').forEach(card => cardObserver.observe(card));
}
