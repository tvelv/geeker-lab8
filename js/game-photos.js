const gamePhotoDetails = {
  wingspan: {
    source: 'https://stonemaiergames.com/games/wingspan/',
    photos: [['wingspan-table', 'Розкладена партія. Фото Тіма Чуона.'], ['wingspan-cards', 'Карти птахів. Фото Тіма Чуона.']]
  },
  catan: {
    source: 'https://www.catan.com/catan',
    photos: [['catan-board', 'Ігрове поле з тайлами й поселеннями'], ['catan-detail', 'Деталі поля та фігурки гравців']]
  },
  dixit: {
    source: 'https://www.libellud.com/en/our-games/dixit/',
    photos: [['dixit-table', 'Гра та її компоненти'], ['dixit-cards', 'Партія Dixit за столом']]
  },
  mysterium: {
    source: 'https://store.asmodee.com/products/mysterium-2025-refresh',
    photos: [['mysterium-detail', 'Комплектація видання 2025 року'], ['mysterium-table', 'Карти та фішки видання 2025 року']]
  },
  harmonies: {
    source: 'https://store.asmodee.com/products/harmonies-1',
    photos: [['harmonies-table', 'Ігрові планшети, жетони та карти'], ['harmonies-box-back', 'Зворот коробки та приклад компонентів']]
  },
  wyrmspan: {
    source: 'https://stonemaiergames.com/games/wyrmspan/',
    photos: [['wyrmspan-detail', 'Wyrmspan на ігровому столі'], ['wyrmspan-table', 'Жетони та фішки крупним планом']]
  },
  'dice-forge': {
    source: 'https://www.libellud.com/en/our-games/dice-forge/',
    photos: [['dice-forge-pieces', 'Ілюстровані карти Dice Forge']]
  },
  scythe: {
    source: 'https://store.stonemaiergames.com/products/scythe',
    photos: [['scythe-table', 'Поле, планшети й фігурки розкладеної партії']]
  }
};

const gamePhotoDialog = document.createElement('dialog');
gamePhotoDialog.className = 'game-photo-dialog';
gamePhotoDialog.setAttribute('aria-labelledby', 'game-photo-title');
gamePhotoDialog.innerHTML = '<header><h2 id="game-photo-title"></h2><button type="button" data-photo-close autofocus aria-label="Закрити фото">✕</button></header>' +
  '<figure><img alt=""><figcaption aria-live="polite"></figcaption></figure>' +
  '<div class="game-photo-controls"><button type="button" data-photo-step="-1" aria-label="Попереднє фото">←</button><span data-photo-count></span><button type="button" data-photo-step="1" aria-label="Наступне фото">→</button></div>' +
  '<a class="game-photo-credit" target="_blank" rel="noopener noreferrer">Зображення на сайті видавця</a>';
document.body.append(gamePhotoDialog);

const gamePhotoImage = gamePhotoDialog.querySelector('img');
const gamePhotoCaption = gamePhotoDialog.querySelector('figcaption');
const gamePhotoCount = gamePhotoDialog.querySelector('[data-photo-count]');
let gamePhotoSlides = [];
let gamePhotoIndex = 0;

function advanceGamePhoto(step) {
  gamePhotoIndex = (gamePhotoIndex + step + gamePhotoSlides.length) % gamePhotoSlides.length;
  const {src, caption} = gamePhotoSlides[gamePhotoIndex];
  gamePhotoImage.alt = caption;
  gamePhotoImage.src = src;
  gamePhotoCaption.textContent = caption;
  gamePhotoCount.textContent = (gamePhotoIndex + 1) + ' / ' + gamePhotoSlides.length;
}

gamePhotoDialog.querySelector('[data-photo-close]').addEventListener('click', () => gamePhotoDialog.close());
for (const button of gamePhotoDialog.querySelectorAll('[data-photo-step]')) {
  button.addEventListener('click', () => advanceGamePhoto(Number(button.dataset.photoStep)));
}
gamePhotoDialog.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  advanceGamePhoto(event.key === 'ArrowLeft' ? -1 : 1);
});

for (const card of document.querySelectorAll('.game-card')) {
  const back = card.querySelector('.flip-card__back');
  const cover = card.querySelector('.flip-card__front img');
  const details = gamePhotoDetails[back?.id.split('game-details-').at(-1)];
  if (!details || !cover) continue;
  const title = back.querySelector('h3').textContent.trim();
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'game-photo-trigger';
  trigger.textContent = 'Фото гри';
  trigger.setAttribute('aria-label', 'Фото гри ' + title);
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.addEventListener('click', () => {
    gamePhotoDialog.querySelector('h2').textContent = 'Фото гри «' + title + '»';
    gamePhotoDialog.querySelector('a').href = details.source;
    gamePhotoSlides = [
      {src: cover.currentSrc || cover.src, caption: 'Обкладинка гри «' + title + '»'},
      ...details.photos.map(([name, caption]) => ({src: 'assets/images/games/detail/' + name + '.webp', caption}))
    ];
    gamePhotoIndex = 0;
    advanceGamePhoto(0);
    gamePhotoDialog.showModal();
  });
  back.append(trigger);
}
