import './styles/global.css';
import './styles/header.css';
import './styles/hero.css';
import './styles/collection.css';
import './styles/extra.css';
import { i18n } from './utils/i18n';
import { products } from './utils/products';

window.i18nManager = i18n;

// Supabase Setup
const SUPABASE_URL = "https://agnztfqynbdvqdpxzajh.supabase.co";
const SUPABASE_KEY = "sb_publishable_L1FEdbVz6jHV3bUvhmMjwg_vW2hZVfY";

let supabase;
if (window.supabase) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

document.addEventListener('DOMContentLoaded', async () => {
  i18n.updateLanguageElements();

  // Fetch products from Supabase
  let dbProducts = products; // Fallback to local
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data && data.length > 0) {
        // Transform to local format if needed or use as is
        dbProducts = {
          skin: data.filter(p => p.category === 'skin'),
          color: data.filter(p => p.category === 'color')
        };
      }
    } catch (e) {
      console.error('Failed to fetch products from Supabase, using local fallback:', e);
    }
  }

  renderProducts(dbProducts);
  setupColorPicker(dbProducts);

  // Fetch and render media lab items
  if (supabase) {
    fetchAndRenderShowcase();
    fetchAndRenderMedia();
    fetchAndRenderContact();
    syncHeroVideo();
  }

  setupScrollAnimations();
  setupVideoAutoplay();
});

const DEFAULT_SHOWCASE_DATA = [
  {
    id: 'default-1',
    type: 'statement', // New field to distinguish layout
    title: "PLAY BEAUTY",
    subtitle: "COLLECTION 01",
    image_url: "./assets/images/showcase-1.jpg", // Ensure this placeholder exists or use a robust fallback
    bg_color: "#EBEBEB",
    order_index: 1
  },
  {
    id: 'default-2',
    type: 'standard',
    title: "Iconic Identity",
    subtitle: "Signature Heart-Logo Branding",
    image_url: "./assets/images/showcase-2.jpg",
    bg_color: "#F5F5F5",
    order_index: 2
  },
  {
    id: 'default-3',
    type: 'standard',
    title: "Natural Purity",
    subtitle: "Essential Skin Ingredients",
    image_url: "./assets/images/showcase-3.jpg",
    bg_color: "#FFFFFF",
    order_index: 3
  }
];

async function fetchAndRenderShowcase() {
  let displayData = [];

  // 1. Try fetching from Supabase
  const { data, error } = await supabase
    .from('collection_showcase')
    .select('*')
    .order('order_index', { ascending: true });

  if (!error && data && data.length > 0) {
    displayData = data;
  } else {
    // 2. Fallback to Default Data
    console.log('Using default showcase data');
    displayData = DEFAULT_SHOWCASE_DATA;
  }

  const slider = document.getElementById('showcase-slider');
  if (!slider) return;

  // Clear existing content (important if re-rendering)
  slider.innerHTML = '';

  // 3. Render items with conditional layouts
  slider.innerHTML = displayData.map(item => {
    // Determine layout type (if not explicitly set in DB, guess based on content or default to standard)
    // For DB items, we might need a convention or a new column. For now, let's assume standard unless specific keywords match
    const isStatement = item.type === 'statement' || item.title === 'PLAY BEAUTY';

    if (isStatement) {
      // STATEMENT LAYOUT (Big Centered Text)
      return `
        <div class="snap-start min-w-full h-full flex flex-col items-center justify-center p-8 bg-cover bg-center group/slide relative overflow-hidden" style="background-color: ${item.bg_color || '#EBEBEB'}">
           <!-- Distinctive big text styling for 'Statement' items -->
           <div class="z-10 text-center mix-blend-multiply opacity-0 animate-showcase-text" style="animation-delay: 0.2s;">
              <h2 class="text-[12vw] lg:text-[15vw] leading-none font-black tracking-tighter text-black mb-4 scale-y-110 transform transition-transform duration-700 group-hover/slide:scale-y-100">
                ${item.title}
              </h2>
              <p class="text-sm lg:text-lg font-bold uppercase tracking-[0.5em] text-red-600">
                ${item.subtitle || 'An experimental, anti-fashion artistic collaboration.'}
              </p>
           </div>
           
           <!-- Optional: Background image can be subtle or hidden for statement cards if text is the hero -->
           ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" class="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-multiply" />` : ''}
        </div>
      `;
    } else {
      // STANDARD LAYOUT (Glass Card at Bottom)
      return `
        <div class="snap-start min-w-full h-full flex flex-col items-center justify-center p-8 bg-cover bg-center group/slide relative overflow-hidden" style="background-color: ${item.bg_color || '#F3F3F3'}">
          <img src="${item.image_url}" alt="${item.title}" class="max-h-[60%] lg:max-h-[70%] object-contain mix-blend-multiply transition-transform duration-700 group-hover/slide:scale-105" />
          
          <div class="absolute bottom-12 left-12 right-12 lg:bottom-20 lg:left-20 max-w-xl">
            <div class="glass-card p-8 rounded-2xl backdrop-blur-md bg-white/30 border border-white/20 shadow-xl translate-y-12 opacity-0 animate-showcase-text">
                <span class="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-2 block">${item.subtitle}</span>
                <h3 class="text-4xl lg:text-6xl font-black text-black uppercase tracking-tighter mb-4">${item.title}</h3>
                <div class="h-1 w-20 bg-red-600"></div>
            </div>
          </div>
        </div>
      `;
    }
  }).join('');
}

async function fetchAndRenderMedia() {
  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .order('order_index', { ascending: true });

  if (error || !data) {
    console.error('Error fetching media:', error);
    return;
  }

  const videoGrid = document.getElementById('video-grid');
  const pdfList = document.getElementById('pdf-list');
  const archiveList = document.getElementById('archive-list');

  if (videoGrid) {
    const videos = data.filter(item => item.type === 'video').slice(0, 4);
    videoGrid.innerHTML = videos.map(v => `
      <div class="video-card animate-on-scroll" onclick="window.open('${v.file_path}', '_blank')">
        <img src="${v.thumbnail_path || './assets/images/video-placeholder.jpg'}" alt="${v.title}" />
        <div class="play-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
        <div class="p-4 absolute bottom-0 left-0 text-white">
            <h4 class="text-sm font-bold">${v.title}</h4>
        </div>
      </div>
    `).join('');
  }

  if (pdfList) {
    const pdfs = data.filter(item => item.type === 'pdf').slice(0, 4);
    pdfList.innerHTML = pdfs.map(p => `
      <a href="${p.file_path}" target="_blank" class="pdf-item animate-on-scroll">
        <div class="pdf-thumb">
          <img src="${p.thumbnail_path || './assets/images/pdf-placeholder.jpg'}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover;" />
        </div>
        <div class="pdf-info">
          <h4>${p.title}</h4>
          <p>${p.sub_title || 'Click to view document'}</p>
        </div>
      </a>
    `).join('');
  }

  if (archiveList) {
    const archives = data.filter(item => item.type === 'archive');
    archiveList.innerHTML = archives.map(a => `
      <a href="${a.file_path}" target="_blank" class="archive-item animate-on-scroll">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <span>${a.title}</span>
      </a>
    `).join('');
  }
}

async function fetchAndRenderContact() {
  const { data, error } = await supabase
    .from('contact_info')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) return;

  const addrEl = document.getElementById('display-address');
  const phoneEl = document.getElementById('display-phone');
  const emailEl = document.getElementById('display-email');

  if (addrEl) addrEl.innerText = data.address;
  if (phoneEl) phoneEl.innerText = data.phone;
  if (emailEl) emailEl.innerText = data.email;
}

function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

async function syncHeroVideo() {
  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .eq('order_index', 1)
    .eq('type', 'video')
    .single();

  if (error || !data) return;

  const videoContainer = document.querySelector('.product-preview');
  if (!videoContainer) return;

  const ytId = getYouTubeId(data.file_path);

  if (ytId) {
    // If it's a YouTube video, replace content with iframe
    const embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`;

    // Only update if changed
    const currentIframe = videoContainer.querySelector('iframe');
    if (!currentIframe || currentIframe.src !== embedUrl) {
      videoContainer.innerHTML = `
        <iframe 
          src="${embedUrl}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
          style="width: 100%; height: 100%; object-fit: cover; border: none; pointer-events: none;"
        ></iframe>
      `;
    }
  } else {
    // If it's a direct file (Supabase or local)
    const videoPlayer = document.getElementById('hero-video-player');

    // If we had an iframe before, we need to restore the video element
    if (!videoPlayer) {
      videoContainer.innerHTML = `
        <video id="hero-video-player" class="autoplay-video" muted playsinline loop style="width: 100%; height: 100%; object-fit: cover;">
          <source src="${data.file_path}" type="video/mp4" />
        </video>
      `;
      const newVideo = document.getElementById('hero-video-player');
      newVideo.play().catch(e => console.log("Autoplay blocked:", e));
    } else {
      const source = videoPlayer.querySelector('source');
      if (source && source.src !== data.file_path) {
        source.src = data.file_path;
        videoPlayer.load();
        videoPlayer.play().catch(e => console.log("Autoplay blocked:", e));
      }
    }
  }
}

function renderProducts(currentProducts) {
  const skinGrid = document.getElementById('skin-grid');
  const colorGrid = document.getElementById('color-grid');

  if (skinGrid) {
    skinGrid.innerHTML = currentProducts.skin.map(p => `
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
    colorGrid.innerHTML = currentProducts.color.map(p => `
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

function setupColorPicker(currentProducts) {
  const swatchesContainer = document.getElementById('color-swatches');
  const overlay = document.getElementById('color-overlay');

  if (swatchesContainer && overlay) {
    swatchesContainer.innerHTML = currentProducts.color.map(p => `
      <span class="color-swatch" style="background: ${p.color_code || p.color}" data-color="${p.color_code || p.color}"></span>
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
