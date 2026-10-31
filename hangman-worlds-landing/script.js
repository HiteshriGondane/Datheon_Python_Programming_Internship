(() => {
  const stars = document.getElementById('stars');
  const landing = document.getElementById('landing');
  const button = document.getElementById('startButton');
  const toast = document.getElementById('toast');
  const illustration = document.getElementById('illustration');
  let toastTimer;

  // Decorative stars are generated locally, so no image downloads are needed.
  for (let i = 0; i < 64; i++) {
    const star = document.createElement('span');
    const size = Math.random() * 2.5 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 4}s`;
    star.style.animationDuration = `${2 + Math.random() * 4}s`;
    stars.appendChild(star);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  button.addEventListener('click', () => {
    landing.classList.remove('party');
    void landing.offsetWidth;
    landing.classList.add('party');
    if (navigator.vibrate) navigator.vibrate([35, 25, 35]);
    window.setTimeout(() => { window.location.href = 'level-select.html'; }, 260);
  });

  // Gentle pointer parallax gives the illustrated scene a playful, layered feel.
  if (window.matchMedia('(pointer:fine)').matches) {
    illustration.addEventListener('pointermove', (event) => {
      const rect = illustration.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      illustration.style.setProperty('--tilt-x', `${x * 5}px`);
      illustration.style.setProperty('--tilt-y', `${y * 5}px`);
      illustration.style.transform = `translate(${x * 5}px, ${y * 5}px)`;
    });
    illustration.addEventListener('pointerleave', () => {
      illustration.style.transform = '';
    });
  }
})();
