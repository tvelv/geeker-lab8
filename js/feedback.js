document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('feedback-form');
  const fields = document.getElementById('feedback-fields');
  const status = document.getElementById('feedback-status');
  const success = document.getElementById('feedback-success');
  const namePattern = /^\p{L}[\p{L}\p{M}]*(?:[ ’'\u02BC-]\p{L}[\p{L}\p{M}]*)*$/u;
  const emailPattern = /^[^\s@]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
  const phonePattern = /^\+380[0-9]{9}$/;

  const validators = new Map([
    [form.elements.name, (value) => {
      const letters = value.match(/\p{L}/gu)?.length ?? 0;
      return letters >= 2 && value.length <= 70 && namePattern.test(value)
        ? '' : 'Введіть щонайменше дві літери. Можна додати пробіл, дефіс або апостроф.';
    }],
    [form.elements.email, (value) => value.length <= 254 && emailPattern.test(value)
      && !form.elements.email.validity.typeMismatch ? '' : 'Введіть адресу у форматі name@example.com.'],
    [form.elements.phone, (value) => phonePattern.test(value)
      ? '' : 'Введіть +380 і ще дев’ять цифр.'],
    [form.elements.message, (value) => value.length >= 10 && value.length <= 1000
      ? '' : 'Напишіть повідомлення від 10 до 1000 символів.'],
    [form.elements.consent, () => form.elements.consent.checked
      ? '' : 'Підтвердьте згоду, щоб перевірити форму.']
  ]);

  function normalizePhone() {
    const phone = form.elements.phone;
    const compact = phone.value.trim().replace(/[\s().-]/g, '');
    if (/^0[0-9]{9}$/.test(compact)) phone.value = '+38' + compact;
    else if (/^380[0-9]{9}$/.test(compact)) phone.value = '+' + compact;
    else phone.value = compact;
  }

  function validate(field) {
    const message = validators.get(field)(field.value.trim());
    const error = document.getElementById(field.id + '-error');
    error.textContent = message;
    error.hidden = !message;
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    field.toggleAttribute('data-valid', !message);
    return !message;
  }

  for (const field of validators.keys()) {
    field.addEventListener('blur', () => {
      if (field === form.elements.phone) normalizePhone();
      if (field.value.trim() && (field.type !== 'checkbox' || field.checked)
          || field.hasAttribute('aria-invalid') || field.hasAttribute('data-valid')) validate(field);
    });
    field.addEventListener(field.type === 'checkbox' ? 'change' : 'input', () => {
      status.textContent = '';
      if (field.hasAttribute('aria-invalid') || field.hasAttribute('data-valid')) validate(field);
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    normalizePhone();
    let firstError;
    for (const field of validators.keys()) {
      if (!validate(field)) firstError ??= field;
    }
    if (firstError) {
      status.textContent = 'Перевірте позначені поля.';
      firstError.focus();
      return;
    }

    form.reset();
    for (const field of validators.keys()) field.removeAttribute('data-valid');
    status.textContent = '';
    success.showModal();
  });

  success.addEventListener('click', (event) => {
    if (event.target === success) {
      const box = success.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right
          || event.clientY < box.top || event.clientY > box.bottom) success.close();
    }
  });
  success.addEventListener('close', () => form.querySelector('[type="submit"]').focus());
  form.noValidate = true;
  fields.disabled = false;
});
