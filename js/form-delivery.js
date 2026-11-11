(() => {
  const accessKey = '';
  const endpoint = 'https://api.web3forms.com/submit';

  window.sendGeekerForm = async (form, subject) => {
    if (!accessKey) throw new Error('Надсилання ще не активовано. Введені дані залишилися у формі.');

    const data = new FormData(form);
    data.set('access_key', accessKey);
    data.set('subject', subject);
    data.set('from_name', 'Geeker');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
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
