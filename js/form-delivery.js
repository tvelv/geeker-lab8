(() => {
  const accessKey = '';
  const endpoint = 'https://api.web3forms.com/submit';

  window.sendGeekerForm = async (form, subject) => {
    if (!accessKey) throw new Error('Адреса отримувача ще не підтверджена. Введені дані залишилися у формі.');

    const fields = Object.fromEntries(new FormData(form));
    const data = { ...fields, access_key: accessKey, subject, from_name: 'Geeker' };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(12000)
      });
      const result = await response.json();
      if (response.ok && result.success === true) return;
    } catch {
      // Keep the values available for another attempt after a network failure.
    }
    throw new Error('Не вдалося надіслати. Дані залишилися у формі. Спробуйте ще раз.');
  };
})();
