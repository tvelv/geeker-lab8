document.addEventListener('DOMContentLoaded', () => {
  const choices = new Map([
    ['catan-tournament', 'Турнірний CATAN'],
    ['wingspan-evening', 'Крила за спільним столом'],
    ['dixit-meetup', 'Dixit і нові знайомства'],
  ]);
  const title = choices.get(new URLSearchParams(window.location.search).get('session'));
  const field = document.getElementById('feedback-message');
  if (!title || !field || field.value.trim()) return;
  field.value = 'Хочу долучитися до клубного сеансу «' + title + '». Підкажіть найближчу дату, вартість і наявність місць.\nКількість учасників: \nЗручний час: ';
  field.dispatchEvent(new Event('input', { bubbles: true }));
});