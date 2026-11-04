/* Local forecast for Lviv and evening planning. */
const motionButton = document.querySelector('.hero-motion-toggle');
const motionHero = motionButton.closest('section');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function syncHeroMotion() {
  motionHero.classList.toggle('hero-motion-enabled', !reducedMotion.matches);
  motionButton.hidden = reducedMotion.matches;
}
syncHeroMotion();
reducedMotion.addEventListener('change', syncHeroMotion);
motionButton.addEventListener('click', () => {
  const paused = motionHero.classList.toggle('hero-motion-paused');
  motionButton.setAttribute('aria-label', paused ? 'Відновити рух банера' : 'Призупинити рух банера');
  motionButton.querySelector('span').textContent = paused ? 'Відновити' : 'Пауза';
});

const weatherStatus = document.querySelector('#weather-status');
const weatherValue = document.querySelector('#weather-value');
const retry = document.querySelector('#weather-retry');
const weatherCard = retry.closest('.weather-card');
const weatherMetrics = weatherCard.querySelector('.weather-metrics');
const forecast = weatherCard.querySelector('.weather-forecast');
const hours = document.querySelector('#weather-hours');
const numberFormat = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 });
const temperature = value => numberFormat.format(value) + ' °C';

function conditions(code, isDay = true) {
  if (code === 0) return ['Ясно', isDay ? '☀' : '☾'];
  if (code <= 3) return [code === 3 ? 'Хмарно' : 'Мінлива хмарність', '☁'];
  if (code <= 48) return ['Туман', '≋'];
  if (code >= 95) return ['Гроза', 'ϟ'];
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ['Сніг', '❄'];
  return [code <= 57 ? 'Мряка' : 'Дощ', '☂'];
}

function renderForecast(hourly, currentTime) {
  const items = [];
  for (const [index, time] of (hourly?.time ?? []).entries()) {
    const value = hourly.temperature_2m?.[index];
    const code = hourly.weather_code?.[index];
    if (typeof time !== 'string' || time <= currentTime || !Number.isFinite(value) || !Number.isFinite(code)) continue;
    const [label, icon] = conditions(code, hourly.is_day?.[index] !== 0);
    const item = document.createElement('li');
    const hour = document.createElement('time');
    hour.dateTime = time;
    hour.textContent = time.slice(11, 16);
    const symbol = document.createElement('span');
    symbol.textContent = icon;
    symbol.setAttribute('aria-hidden', 'true');
    const description = document.createElement('span');
    description.className = 'sr-only';
    description.textContent = label;
    const reading = document.createElement('strong');
    reading.textContent = temperature(value);
    item.append(hour, symbol, description, reading);
    items.push(item);
    if (items.length === 3) break;
  }
  hours.replaceChildren(...items);
  forecast.hidden = items.length === 0;
}

async function updateWeather() {
  if (retry.disabled) return;
  retry.disabled = true;
  weatherStatus.textContent = 'Завантажуємо поточні дані…';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=49.84&longitude=24.03&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,weather_code,is_day&forecast_days=2&timezone=Europe%2FKyiv', { signal: controller.signal });
    if (!response.ok) throw new Error('Weather unavailable');
    const data = await response.json();
    const current = data.current;
    if (!Number.isFinite(current?.temperature_2m) || !Number.isFinite(current?.weather_code) || typeof current?.time !== 'string') throw new Error('Invalid data');
    const [description, icon] = conditions(current.weather_code, current.is_day !== 0);
    weatherValue.textContent = temperature(current.temperature_2m);
    document.querySelector('#weather-icon').textContent = icon;
    document.querySelector('#weather-feels').textContent = Number.isFinite(current.apparent_temperature) ? temperature(current.apparent_temperature) : '—';
    document.querySelector('#weather-wind').textContent = Number.isFinite(current.wind_speed_10m) ? numberFormat.format(current.wind_speed_10m) + ' км/год' : '—';
    weatherMetrics.hidden = false;
    renderForecast(data.hourly, current.time);
    weatherStatus.textContent = description + '. Дані на ' + current.time.slice(11, 16) + ' за Києвом.';
  } catch {
    weatherStatus.textContent = weatherMetrics.hidden
      ? 'Не вдалося завантажити погоду. Спробуйте оновити.'
      : 'Не вдалося оновити погоду. Показано попередні дані.';
  } finally {
    clearTimeout(timeout);
    retry.disabled = false;
  }
}

retry.hidden = false;
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    updateWeather();
  }, { rootMargin: '200px' });
  observer.observe(weatherStatus);
  retry.addEventListener('click', () => {
    observer.disconnect();
    updateWeather();
  });
} else {
  retry.addEventListener('click', updateWeather);
  updateWeather();
}

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

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const cardObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-revealed');
      cardObserver.unobserve(entry.target);
    }
  }, { threshold: 0.2 });

  document.querySelectorAll('#benefits article, #services article').forEach(card => cardObserver.observe(card));
}
