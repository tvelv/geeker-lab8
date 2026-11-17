(() => {
  const guests = document.querySelector('#budget-guests');
  const hours = document.querySelector('#budget-hours');
  const game = document.querySelector('#budget-game');
  const snacks = document.querySelector('#budget-snacks');
  const message = document.querySelector('#budget-error');
  const total = document.querySelector('#budget-total');
  if (!guests || !hours || !game || !snacks || !message || !total) return;

  const allowedGameFees = new Set(['0', '150', '250']);
  const formatMoney = new Intl.NumberFormat('uk-UA');

  function updateEstimate() {
    let error = '';
    const players = guests.valueAsNumber;
    const duration = hours.valueAsNumber;

    if (guests.value.trim() === '' || hours.value.trim() === '') {
      error = 'Заповніть кількість гравців і тривалість вечора.';
    } else if (!Number.isSafeInteger(players) || players < 1 || players > 12) {
      error = 'Вкажіть ціле число гравців від 1 до 12.';
    } else if (!Number.isSafeInteger(duration) || duration < 1 || duration > 8) {
      error = 'Вкажіть цілу тривалість від 1 до 8 годин.';
    } else if (!allowedGameFees.has(game.value)) {
      error = 'Оберіть один із доступних форматів гри.';
    }

    message.textContent = error;
    [guests, hours, game].forEach((field) => {
      field.toggleAttribute('aria-invalid', Boolean(error));
    });

    if (error) {
      total.textContent = '—';
      return;
    }

    const amount = players * duration * 100 + Number(game.value) + (snacks.checked ? 200 : 0);
    if (!Number.isSafeInteger(amount) || amount < 0) {
      message.textContent = 'Не вдалося розрахувати суму. Перевірте введені значення.';
      total.textContent = '—';
      return;
    }

    total.textContent = formatMoney.format(amount) + ' грн';
  }

  ['input', 'change'].forEach((eventName) => {
    [guests, hours, game, snacks].forEach((field) => {
      field.addEventListener(eventName, updateEstimate);
    });
  });

  updateEstimate();
})();
