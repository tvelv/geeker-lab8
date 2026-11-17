(() => {
  const widget = document.querySelector('#budget');
  if (!widget) return;

  const guests = widget.querySelector('#budget-guests');
  const hours = widget.querySelector('#budget-hours');
  const game = widget.querySelector('#budget-game');
  const snacks = widget.querySelector('#budget-snacks');
  const message = widget.querySelector('#budget-error');
  const total = widget.querySelector('#budget-total');
  if (!guests || !hours || !game || !snacks || !message || !total) return;

  const fees = new Map([['0', 0], ['150', 150], ['250', 250]]);
  const money = new Intl.NumberFormat('uk-UA');

  function hasValidCount(field, max) {
    const value = field.valueAsNumber;
    return Number.isSafeInteger(value) && value >= 1 && value <= max;
  }

  function setFieldError(field, invalid) {
    if (invalid) {
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', 'budget-error');
    } else {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
  }

  function updateEstimate() {
    const fee = fees.get(game.value);
    const errors = [
      [guests, hasValidCount(guests, 12) ? '' : 'Вкажіть ціле число гравців від 1 до 12.'],
      [hours, hasValidCount(hours, 8) ? '' : 'Вкажіть цілу тривалість від 1 до 8 годин.'],
      [game, fee === undefined ? 'Оберіть один із доступних форматів гри.' : ''],
    ];
    for (const [field, error] of errors) setFieldError(field, Boolean(error));
    const feedback = errors.map(([, error]) => error).filter(Boolean).join(' ');
    if (feedback) {
      message.textContent = feedback;
      total.textContent = '—';
      return;
    }

    const base = guests.valueAsNumber * hours.valueAsNumber * 100;
    const amount = base + fee + (snacks.checked ? 200 : 0);
    const valid = Number.isSafeInteger(amount) && amount >= 0;
    message.textContent = valid ? '' : 'Не вдалося розрахувати суму.';
    total.textContent = valid ? money.format(amount) + ' грн' : '—';
  }

  widget.addEventListener('input', updateEstimate);
  widget.addEventListener('change', updateEstimate);
  updateEstimate();
})();