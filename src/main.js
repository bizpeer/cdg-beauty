import './styles/global.css';
import './styles/header.css';
import './styles/hero.css';
import './styles/collection.css';
import './styles/extra.css';
import { i18n } from './utils/i18n';
import { products } from './utils/products';

window.i18nManager = i18n;

document.addEventListener('DOMContentLoaded', () => {
  i18n.updateLanguageElements();
  renderProducts();
  setupColorPicker();
  setupScrollAnimations();
  setupVideoAutoplay();
});

function renderProducts() {
  const skinGrid = document.getElementById('skin-grid');
  const colorGrid = document.getElementById('color-grid');

  if (skinGrid) {
    skinGrid.innerHTML = products.skin.map(p => `
      <div class="product-card animate-on-scroll">
        <div class="product-image-container">
          <img src="${p.img}" alt="${p.name}" class="product-image" loading="lazy" />
          <img src="${p.texture}" alt="${p.name} Texture" class="texture-image" loading="lazy" />
        </div>
        <div class="product-info">
          <h3>${p.name}</h3>
          <p>${p.tagline}</p>
          <a href="#partner" class="inquiry-btn" data-i18n="products.inquiry">Inquiry</a>
        </div>
      </div>
    `).join('');
  }

  if (colorGrid) {
    colorGrid.innerHTML = products.color.map(p => `
      <div class="product-card animate-on-scroll">
        <div class="product-image-container">
          <img src="${p.img}" alt="${p.name}" class="product-image" loading="lazy" />
          <div style="background: ${p.color}; width: 100%; height: 100%; position: absolute; top:0; left:0; opacity:0;" class="texture-image"></div>
        </div>
        <div class="product-info">
          <h3 style="color: ${p.color}">${p.name}</h3>
          <p>${p.tagline}</p>
          <a href="#partner" class="inquiry-btn" data-i18n="products.inquiry">Inquiry</a>
        </div>
      </div>
    `).join('');
  }
}

function setupColorPicker() {
  const swatchesContainer = document.getElementById('color-swatches');
  const overlay = document.getElementById('color-overlay');

  if (swatchesContainer && overlay) {
    swatchesContainer.innerHTML = products.color.map(p => `
      <span class="color-swatch" style="background: ${p.color}" data-color="${p.color}"></span>
    `).join('');

    const swatches = document.querySelectorAll('.color-swatch');
    swatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        const color = swatch.getAttribute('data-color');
        overlay.style.backgroundColor = color;
        overlay.style.opacity = '0.4';

        swatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
      });
    });

    // Default select first color
    if (swatches[0]) swatches[0].click();
  }
}

function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
    observer.observe(el);
  });
}

function setupVideoAutoplay() {
  const videos = document.querySelectorAll('.autoplay-video');

  videos.forEach(video => {
    // Attempt play
    video.play().catch(() => {
      console.log('Autoplay blocked, waiting for interaction');
    });

    // Intersection observer to play/pause video when in view
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) video.play();
        else video.pause();
      });
    }, { threshold: 0.2 });

    videoObserver.observe(video);
  });
}

// Global lang change listener
window.addEventListener('langChange', () => {
  i18n.updateLanguageElements();
});
