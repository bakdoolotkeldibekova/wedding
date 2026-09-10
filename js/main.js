(function () {
  'use strict';

  const EVENT_DATE = new Date('2026-10-11T16:00:00+06:00');

  const HERO_PHOTOS = [
    'images/hero/1.jpeg?v=5',
    'images/hero/2.jpeg?v=5',
    'images/hero/3.jpeg?v=5',
    'images/hero/4.jpeg?v=5'
  ];

  const musicToggle = document.getElementById('music-toggle');
  const bgMusic = document.getElementById('bg-music');
  const musicUnlock = document.getElementById('music-unlock');
  const heroSlidesEl = document.getElementById('hero-slides');

  let slides = [];
  let currentSlide = 0;
  const SLIDE_INTERVAL = 3500;

  function loadSlide(img, src) {
    if (!img || img.dataset.loaded) return;
    img.src = src;
    img.decoding = 'async';
    img.dataset.loaded = '1';
  }

  HERO_PHOTOS.forEach((src, i) => {
    const img = document.createElement('img');
    img.className = 'hero__slide' + (i === 0 ? ' active' : '');
    img.alt = 'Айпери';
    if (i === 0) {
      loadSlide(img, src);
      if ('fetchPriority' in img) img.fetchPriority = 'high';
    } else {
      img.dataset.src = src;
    }
    heroSlidesEl.appendChild(img);
  });
  slides = heroSlidesEl.querySelectorAll('.hero__slide');

  window.addEventListener('load', () => {
    if (slides[1]) loadSlide(slides[1], HERO_PHOTOS[1]);
  });

  let musicPlaying = false;
  let userPaused = false;
  let needsUnmute = false;

  function syncMusicButton() {
    musicToggle.classList.toggle('playing', musicPlaying && !bgMusic.paused);
  }

  function hideMusicUnlock() {
    if (!musicUnlock) return;
    musicUnlock.classList.add('hidden');
    musicUnlock.setAttribute('aria-hidden', 'true');
  }

  function showMusicUnlock() {
    if (!musicUnlock || userPaused) return;
    musicUnlock.classList.remove('hidden');
    musicUnlock.setAttribute('aria-hidden', 'false');
  }

  function tryPlayMusic() {
    if (userPaused) return Promise.resolve(false);

    bgMusic.volume = 1;
    bgMusic.muted = false;

    return bgMusic.play().then(() => {
      needsUnmute = false;
      musicPlaying = true;
      syncMusicButton();
      hideMusicUnlock();
      return true;
    }).catch(() => {
      bgMusic.muted = true;
      return bgMusic.play().then(() => {
        needsUnmute = true;
        musicPlaying = true;
        syncMusicButton();
        showMusicUnlock();
        return true;
      }).catch(() => {
        musicPlaying = false;
        syncMusicButton();
        showMusicUnlock();
        return false;
      });
    });
  }

  function bootstrapMusic() {
    bgMusic.muted = false;
    tryPlayMusic();
  }

  bootstrapMusic();
  bgMusic.addEventListener('loadeddata', bootstrapMusic);
  bgMusic.addEventListener('canplaythrough', bootstrapMusic);
  window.addEventListener('pageshow', bootstrapMusic);

  let retryCount = 0;
  const musicRetry = setInterval(() => {
    if (musicPlaying && !needsUnmute) {
      clearInterval(musicRetry);
      return;
    }
    if (userPaused || retryCount++ > 12) {
      clearInterval(musicRetry);
      return;
    }
    tryPlayMusic();
  }, 1000);

  function resumeOnInteraction() {
    if (userPaused) return;
    if (needsUnmute || bgMusic.paused) {
      bgMusic.muted = false;
      tryPlayMusic();
    }
  }

  if (musicUnlock) {
    musicUnlock.addEventListener('click', resumeOnInteraction);
    musicUnlock.addEventListener('touchstart', resumeOnInteraction, { passive: true });
  }

  ['click', 'touchstart', 'keydown', 'scroll', 'pointerdown', 'mousemove'].forEach((eventName) => {
    window.addEventListener(eventName, resumeOnInteraction, { passive: true, capture: true });
  });

  musicToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (musicPlaying && !bgMusic.paused) {
      bgMusic.pause();
      musicPlaying = false;
      userPaused = true;
      needsUnmute = false;
      syncMusicButton();
      hideMusicUnlock();
    } else {
      userPaused = false;
      needsUnmute = false;
      tryPlayMusic();
    }
  });

  function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    loadSlide(slides[currentSlide], HERO_PHOTOS[currentSlide]);
    const preloadIndex = (currentSlide + 1) % slides.length;
    loadSlide(slides[preloadIndex], HERO_PHOTOS[preloadIndex]);
    slides[currentSlide].classList.add('active');
  }

  setInterval(nextSlide, SLIDE_INTERVAL);

  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins = document.getElementById('cd-mins');
  const cdSecs = document.getElementById('cd-secs');

  function updateCountdown() {
    const now = new Date();
    const diff = EVENT_DATE - now;

    if (diff <= 0) {
      cdDays.textContent = '00';
      cdHours.textContent = '00';
      cdMins.textContent = '00';
      cdSecs.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    cdDays.textContent = String(days).padStart(2, '0');
    cdHours.textContent = String(hours).padStart(2, '0');
    cdMins.textContent = String(mins).padStart(2, '0');
    cdSecs.textContent = String(secs).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));

  const heroScroll = document.querySelector('.hero__scroll');
  const invitationSection = document.getElementById('invitation');

  if (heroScroll && invitationSection) {
    heroScroll.addEventListener('click', () => {
      invitationSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  document.querySelectorAll('.closing__title, .closing__title2').forEach((el) => {
    el.innerHTML = el.textContent.replace(/А/g, '<span class="readable-a">А</span>');
  });

})();
