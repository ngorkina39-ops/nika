const phrases = [
  'яркие эмоции',
  'семья',
  'дом',
  'близкие люди',
  'теплые воспоминания',
  'гарантированно классное лето!',
  'любовь к своему делу',
  'детский смех'
];

const phraseElement = document.querySelector('.phrase');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

let phraseQueue = [];

async function typePhrases() {
  // При загрузке показываем «что?» из HTML и не стираем его сразу
  let currentPhrase = phraseElement.textContent.trim();
  await wait(2000);

  while (true) {
    // Стираем текущую фразу
    for (let i = currentPhrase.length; i > 0; i--) {
      phraseElement.textContent = currentPhrase.slice(0, i - 1);
      await wait(30);
    }

    // Фразы идут в случайном порядке, но без повторов до конца круга
    if (phraseQueue.length === 0) {
      phraseQueue = shuffle(phrases);
    }
    const nextPhrase = phraseQueue.pop();

    // Печатаем следующую фразу
    for (let i = 1; i <= nextPhrase.length; i++) {
      phraseElement.textContent = nextPhrase.slice(0, i);
      await wait(55 + Math.random() * 30);
    }

    currentPhrase = nextPhrase;
    await wait(1800);
  }
}

typePhrases();



document.addEventListener('DOMContentLoaded', () => {
  const trainers = [
    { name: 'РУЗАНОВ ДЕНИС', role: 'Председатель', photo: 'videos/opt/рузанов.jpg' },
    { name: 'САЛМИНА КСЕНИЯ', role: 'Комиссар', photo: 'videos/opt/салмина.jpg' },
    { name: 'АШИРОВ РАМИР', role: 'Ревизор', photo: 'videos/opt/аширов.jpg' },
    { name: 'ИСЯКАЕВА ЭМИЛИЯ', role: 'Координатор', photo: 'videos/opt/исякаева.jpg' },
    { name: 'ПАВЛУНИНА ДАРЬЯ', role: 'Руководитель пресс-центра', photo: "videos/opt/павлунина.jpg" },
    { name: 'АННА СИМДЯШКИНА', role: 'Методист', photo: "videos/opt/симдяшкина.jpg" },
    { name: 'ВЕРЕТЕХИНА СОФЬЯ', role: 'Руководитель финансового сектора', photo: "videos/opt/веретех.jpg" },
    { name: 'КУЗЬМИН МИХАИЛ', role: 'Руководитель технической группы', photo: "videos/opt/кузьмин.jpg" },
    { name: 'СКВОРЦОВ АРСЕНИЙ', role: 'Диджей', photo: "videos/opt/скворцов.jpg"},
    { name: 'СУЛЬДИНА АННА', role: 'Заместитель методиста', photo: "videos/opt/сульдина.jpg" },
    { name: 'ЧЕМАЕВА КРИСТИНА', role: 'Заместитель комиссара', photo: "videos/opt/чемаева.jpg" }
  ];

  const template = document.getElementById('cardTemplate');
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.querySelector('.carousel-btn--prev');
  const nextBtn = document.querySelector('.carousel-btn--next');

  // Генерируем карточки
  trainers.forEach(trainer => {
    const card = template.content.cloneNode(true);
    const photo = card.querySelector('img');
    photo.src = trainer.photo;
    photo.alt = trainer.name;
    // Фото ниже первого экрана — грузим по мере прокрутки
    photo.loading = 'lazy';
    photo.decoding = 'async';
    card.querySelector('.carousel-card_name').textContent = trainer.name;
    card.querySelector('.carousel-card_role').textContent = trainer.role;
    track.appendChild(card);
  });

  // Инициализируем сразу: ширины карточек заданы в CSS и не зависят
  // от загрузки фото, поэтому ждать отдельного кадра не нужно
  (() => {
    const originalCards = Array.from(track.children);
    let step = 0;

    // Создаём клоны
    const clonesEnd = originalCards.map(card => card.cloneNode(true));
    const clonesStart = originalCards.map(card => card.cloneNode(true));

    // Добавляем клоны в конец
    clonesEnd.forEach(clone => track.appendChild(clone));
    // Добавляем клоны в начало (в обратном порядке)
    clonesStart.reverse().forEach(clone => track.insertBefore(clone, track.firstChild));

    // Начинаем с первого оригинала (после клонов в начале)
    let currentIndex = originalCards.length;
    let isAnimating = false;

    function updatePosition(instant = false) {
      track.style.transition = instant ? 'none' : 'transform 0.5s ease';
      track.style.transform = `translateX(-${currentIndex * step}px)`;
    }

    function measureStep() {
      const cardWidth = originalCards[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 24;
      step = cardWidth + gap;

      // Высота фото нужна CSS, чтобы поставить стрелки ровно по его центру
      const image = originalCards[0].querySelector('.carousel-card_image');
      const carousel = track.closest('.carousel');
      if (image && carousel) {
        carousel.style.setProperty('--carousel-image-h', `${image.getBoundingClientRect().height}px`);
      }
    }

    // Устанавливаем начальную позицию без анимации
    measureStep();
    updatePosition(true);

    function next() {
      if (isAnimating) return;
      isAnimating = true;
      currentIndex++;
      updatePosition();

      track.addEventListener('transitionend', function handler() {
        track.removeEventListener('transitionend', handler);
        isAnimating = false;

        // Если дошли до клонов в конце — прыгаем на оригинал
        if (currentIndex >= originalCards.length * 2) {
          currentIndex = originalCards.length;
          updatePosition(true);
        }
      });
    }

    function prev() {
      if (isAnimating) return;
      isAnimating = true;
      currentIndex--;
      updatePosition();

      track.addEventListener('transitionend', function handler() {
        track.removeEventListener('transitionend', handler);
        isAnimating = false;

        // Если дошли до клонов в начале — прыгаем на оригинал в конце
        if (currentIndex < originalCards.length) {
          currentIndex = originalCards.length * 2 - 1;
          updatePosition(true);
        }
      });
    }

    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    // Свайп по карусели на телефоне: влево — следующий, вправо — предыдущий
    const swipeArea = track.parentElement;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchActive = false;

    swipeArea.addEventListener('touchstart', (event) => {
      if (event.touches.length !== 1) return;
      touchActive = true;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }, { passive: true });

    swipeArea.addEventListener('touchend', (event) => {
      if (!touchActive) return;
      touchActive = false;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) {
          next();
        } else {
          prev();
        }
      }
    }, { passive: true });

    // При изменении масштаба или ширины окна пересчитываем шаг карточек
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        measureStep();
        currentIndex = originalCards.length;
        isAnimating = false;
        updatePosition(true);
      }, 150);
    });
  })();
});

// Дублируем наборы фото в лентах лагерей — для бесшовной зацикленной прокрутки.
// Скорость задаём в px/сек и считаем её от реальной ширины ленты, чтобы обе
// карточки двигались одинаково, даже если ширина ленты у них разная.
document.addEventListener('DOMContentLoaded', () => {
  const PX_PER_SECOND = 40;

  function updateMarqueeSpeed(track) {
    const set = track.querySelector('.camp-gallery_set');
    if (!set) return;
    const setWidth = set.getBoundingClientRect().width;
    if (!setWidth) return;
    // Один цикл анимации = ширина одного набора фото
    track.style.setProperty('--camp-marquee-duration', `${setWidth / PX_PER_SECOND}s`);
  }

  document.querySelectorAll('.camp-gallery_track').forEach((track) => {
    const set = track.querySelector('.camp-gallery_set');
    if (!set) return;
    const clone = set.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    // Safari на iPhone не подгружает lazy-картинки, которые находятся
    // за пределами экрана внутри трансформируемой ленты. Из-за этого
    // во второй половине цикла появлялись пустые места.
    clone.querySelectorAll('img').forEach((img) => {
      img.loading = 'eager';
    });
    track.appendChild(clone);
    updateMarqueeSpeed(track);
  });

  // При изменении окна ширина фото меняется (clamp) — пересчитываем скорость
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.querySelectorAll('.camp-gallery_track').forEach(updateMarqueeSpeed);
    }, 150);
  });
});

// Кнопка «Наверх»: появляется после прокрутки вниз и возвращает к началу страницы
document.addEventListener('DOMContentLoaded', () => {
  const toTopButton = document.getElementById('toTop');
  if (!toTopButton) return;

  const SHOW_AFTER = 400; // px прокрутки, после которых кнопка появляется

  const toggleVisibility = () => {
    toTopButton.classList.toggle('to-top--visible', window.scrollY > SHOW_AFTER);
  };

  toTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();
});

// Видео об отряде есть только на широком экране. На телефоне секция
// скрыта, поэтому ролик не запускаем и не скачиваем (preload="none")
document.addEventListener('DOMContentLoaded', () => {
  const video = document.querySelector('.about-video video');
  if (!video) return;

  const wideScreen = window.matchMedia('(min-width: 1200px)');
  let videoVisible = false;

  const syncVideo = () => {
    if (wideScreen.matches && videoVisible) {
      const playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
    }
  };

  // Начинаем загрузку ролика только когда блок реально показан на экране
  if (window.IntersectionObserver) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        videoVisible = entry.isIntersecting;
        syncVideo();
      });
    }, { rootMargin: '200px' });
    observer.observe(video);
  } else {
    videoVisible = true;
    syncVideo();
  }

  if (wideScreen.addEventListener) {
    wideScreen.addEventListener('change', syncVideo);
  } else if (wideScreen.addListener) {
    wideScreen.addListener(syncVideo);
  }
});

// Подгонка текста шапки под светло-зелёную часть волны.
// Размер шрифта подбирается так, чтобы заголовок и подписи занимали
// всю доступную область (по ширине и высоте) и не вылезали на тёмную полосу.
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const box = document.querySelector('.logo-text');
  if (!header || !box) return;

  const wave = header.querySelector('.wave1');
  const title = box.querySelector('.logo-title');
  if (!wave || !title) return;

  // Доля высоты волны, до которой доходит её светлая часть
  // (ниже уже начинается тёмная полоса и фото)
  const GREEN_BOTTOM = 0.455;
  // Соотношение размеров подписей и заголовка
  const SUB_RATIO = 0.5;
  const MIN_SUB = 11;
  const MAX_SUB = 17;
  const MIN_TITLE = 8;
  // Предохранитель от бесконечно крупного шрифта
  const MAX_TITLE = 60;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function measure(titleSize) {
    const subSize = clamp(titleSize * SUB_RATIO, MIN_SUB, MAX_SUB);
    header.style.setProperty('--fs-title', `${titleSize.toFixed(2)}px`);
    header.style.setProperty('--fs-sub', `${subSize.toFixed(2)}px`);
    // getBoundingClientRect заставляет браузер пересчитать раскладку
    return box.getBoundingClientRect().height;
  }

  function fit() {
    const headerRect = header.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    const waveHeight = wave.getBoundingClientRect().height;

    // Раскладка ещё не готова — попробуем позже
    if (!waveHeight || !boxRect.width) return;

    const top = boxRect.top - headerRect.top;
    const bottom = waveHeight * GREEN_BOTTOM;
    const available = Math.max(40, bottom - top - 4);

    let lo = MIN_TITLE;
    let hi = MAX_TITLE;

    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      if (measure(mid) <= available) {
        lo = mid;
      } else {
        hi = mid;
      }
    }

    // Финальный проход: фиксируем найденный размер
    measure(lo);
  }

  function scheduleFit() {
    clearTimeout(scheduleFit.timer);
    scheduleFit.timer = setTimeout(fit, 60);
  }

  // Первый расчёт делаем сразу: скрипт подключён в конце body
  fit();

  // Шрифт влияет на ширину строк — пересчитываем после его загрузки
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fit);
  }

  window.addEventListener('load', fit);
  window.addEventListener('resize', scheduleFit, { passive: true });
  window.addEventListener('orientationchange', scheduleFit, { passive: true });

  if (window.ResizeObserver) {
    const observer = new ResizeObserver(scheduleFit);
    observer.observe(header);
  }
});


