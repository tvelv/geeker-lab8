const bookingForm = document.querySelector('#booking-form');
const bookingDate = bookingForm.elements.date;
const bookingButton = bookingForm.querySelector('[type="submit"]');
const bookingStatus = document.querySelector('#booking-result');

function setEarliestBookingDate() {
  const now = new Date();
  bookingDate.min = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');
}

setEarliestBookingDate();
bookingButton.disabled = false;

bookingForm.addEventListener('focusin', setEarliestBookingDate);
bookingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (bookingButton.disabled) return;

  setEarliestBookingDate();
  const phone = bookingForm.elements.phone;
  phone.setCustomValidity('');
  const digits = phone.value.replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 15) {
    phone.setCustomValidity('Введіть номер телефону з 9–15 цифр.');
  }
  if (!bookingForm.reportValidity()) return;

  bookingButton.disabled = true;
  bookingStatus.textContent = 'Надсилаємо заявку…';
  try {
    await window.sendGeekerForm(bookingForm, 'Geeker — заявка на бронювання');
    bookingForm.reset();
    bookingStatus.textContent = 'Заявку надіслано. Бронювання потребує підтвердження Geeker.';
  } catch (error) {
    bookingStatus.textContent = error.message;
  } finally {
    bookingButton.disabled = false;
  }
});

bookingForm.elements.phone.addEventListener('input', (event) => {
  event.currentTarget.setCustomValidity('');
});
