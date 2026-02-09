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
    type: 'statement',
    title: "PLAY BEAUTY",
    subtitle: "PREMIUM LINE-UP", // Changed to tagline style
    description: "An experimental, anti-fashion artistic collaboration. Rooted in emotion and deconstructive purity.",
    features: [
      { title: "Iconic Identity", desc: "Signature Heart Logo Branding", icon: "heart" },
      { title: "Natural Purity", desc: "Essential Skin Ingredients", icon: "sparkle" }
    ],
    image_url: "./assets/images/showcase-1.jpg",
    bg_color: "#F3F3F3", // Light grey background for the container
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
    console.log('📊 Showcase data from Supabase:', data);
    displayData = data;
  } else {
    // 2. Fallback to Default Data using deep copy to avoid mutation issues if reused
    console.log('⚠️ Using default showcase data (no DB data found)');
    displayData = JSON.parse(JSON.stringify(DEFAULT_SHOWCASE_DATA));
  }

  const slider = document.getElementById('showcase-slider');
  if (!slider) {
    console.error('❌ showcase-slider element not found!');
    return;
  }

  // Clear existing content (important if re-rendering)
  slider.innerHTML = '';

  // 3. Render items with conditional layouts
  slider.innerHTML = displayData.map((item, index) => {
    console.log(`🔍 Processing item ${index}:`, item);

    // Robust check for Statement Layout
    // Check: type field, title match (case-insensitive, whitespace-trimmed), or first item
    const titleNormalized = (item.title || '').trim().toUpperCase().replace(/\s+/g, ' ');
    const isStatement = (item.type === 'statement') ||
      (titleNormalized === 'PLAY BEAUTY') ||
      (index === 0); // Force first item to be statement layout

    console.log(`  → isStatement: ${isStatement}, title: "${item.title}", normalized: "${titleNormalized}"`);

    // Polyfill features/description for Statement items if missing (e.g. from DB)
    if (isStatement) {
      if (!item.features) {
        console.log('  → Adding default features');
        item.features = [
          { title: "Iconic Identity", desc: "Signature Heart Logo Branding", icon: "heart" },
          { title: "Natural Purity", desc: "Essential Skin Ingredients", icon: "sparkle" }
        ];
      }
      if (!item.description) {
        console.log('  → Adding default description');
        item.description = "An experimental, anti-fashion artistic collaboration. Rooted in emotion and deconstructive purity.";
      }
      if (!item.subtitle || item.subtitle === 'COLLECTION 01') {
        console.log('  → Setting subtitle to PREMIUM LINE-UP');
        item.subtitle = "PREMIUM LINE-UP";
      }
    }

    if (isStatement) {
      // STATEMENT LAYOUT (Side-by-Side: Image Left, Card Right)
      const featuresHtml = item.features ? item.features.map(f => `
        <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px;">
            <div style="padding: 12px; background-color: #FEF2F2; border-radius: 12px; color: #D30000;">
                ${f.icon === 'heart' ?
          `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`
          :
          `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>`
        }
            </div>
            <div>
                <h4 style="font-weight: bold; font-size: 14px; color: #111827;">${f.title}</h4>
                <p style="font-size: 12px; color: #6B7280;">${f.desc}</p>
            </div>
        </div>
      `).join('') : '';

      return `
        <div style="scroll-snap-align: start; min-width: 100%; height: 100%; display: flex; flex-direction: row; background-color: #F3F3F3; position: relative; overflow: hidden;">
           
           <!-- Left: Image Section -->
           <div class="showcase-image-section" style="width: 50%; height: 100%; position: relative; overflow: hidden;">
              <img src="${item.image_url}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s;" />
           </div>

           <!-- Right: Content Section -->
           <div class="showcase-content-section" style="width: 50%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 48px; position: relative;">
              <!-- White Card -->
              <div class="showcase-card" style="background: white; border-radius: 32px; padding: 48px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); width: 100%; max-width: 512px; position: relative; z-index: 10;">
                  
                  <!-- Tag -->
                  <div style="display: inline-block; background-color: #D30000; color: white; font-size: 10px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px;">
                    ${item.subtitle}
                  </div>

                  <!-- Title -->
                  <h2 class="showcase-title" style="font-size: 72px; font-weight: 900; font-style: italic; letter-spacing: -0.05em; color: black; margin-bottom: 24px; line-height: 0.85;">
                    ${item.title.split(' ').join('<br/>')}
                  </h2>

                  <!-- Description -->
                  <p class="showcase-description" style="font-size: 14px; color: #6B7280; margin-bottom: 40px; line-height: 1.6; max-width: 384px;">
                    ${item.description}
                  </p>

                  <!-- Features -->
                  <div style="border-top: 1px solid #F3F4F6; padding-top: 24px;">
                    ${featuresHtml}
                  </div>

              </div>
           </div>
        </div>
        
        <style>
          @media (max-width: 768px) {
            .showcase-image-section,
            .showcase-content-section {
              width: 100% !important;
              height: 50% !important;
            }
            
            .showcase-content-section {
              padding: 24px !important;
            }
            
            .showcase-card {
              padding: 24px !important;
            }
            
            .showcase-title {
              font-size: 36px !important;
              line-height: 0.9 !important;
            }
            
            .showcase-description {
              font-size: 13px !important;
              margin-bottom: 24px !important;
            }
          }
        </style>
      `;
    } else {
      // STANDARD LAYOUT (Glass Card at Bottom)
      // Removed opacity-0 to ensure visibility
      return `
        <div class="snap-start min-w-full h-full flex flex-col items-center justify-center p-8 bg-cover bg-center group/slide relative overflow-hidden" style="background-color: ${item.bg_color || '#F3F3F3'}">
          <img src="${item.image_url}" alt="${item.title}" class="max-h-[60%] lg:max-h-[70%] object-contain mix-blend-multiply transition-transform duration-700 group-hover/slide:scale-105" />
          
          <div class="absolute bottom-12 left-12 right-12 lg:bottom-20 lg:left-20 max-w-xl">
            <div class="glass-card p-8 rounded-2xl backdrop-blur-md bg-white/30 border border-white/20 shadow-xl translate-y-12 animate-showcase-text">
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

  // 1. Hero Video Update
  const heroContainer = document.querySelector('.product-preview');
  if (heroContainer) {
    const ytId = getYouTubeId(data.file_path);
    if (ytId) {
      const embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`;
      const currentIframe = heroContainer.querySelector('iframe');
      if (!currentIframe || currentIframe.src !== embedUrl) {
        heroContainer.innerHTML = `<iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 100%; object-fit: cover; border: none; pointer-events: none;"></iframe>`;
      }
    } else {
      let videoPlayer = document.getElementById('hero-video-player');
      if (!videoPlayer) {
        heroContainer.innerHTML = `<video id="hero-video-player" class="autoplay-video" muted playsinline loop style="width: 100%; height: 100%; object-fit: cover;"><source src="${data.file_path}" type="video/mp4" /></video>`;
        videoPlayer = document.getElementById('hero-video-player');
        videoPlayer.play().catch(e => console.log("Autoplay blocked:", e));
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

  // 2. Bottom Video Update
  const bottomContainer = document.getElementById('bottom-video-container');
  if (bottomContainer) {
    const ytId = getYouTubeId(data.file_path);
    if (ytId) {
      const embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`;
      bottomContainer.innerHTML = `<iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 100%; object-fit: cover; border: none; pointer-events: none;"></iframe>`;
    } else {
      bottomContainer.innerHTML = `
        <video class="autoplay-video" muted playsinline loop style="width: 100%; height: 100%; object-fit: cover;">
          <source src="${data.file_path}" type="video/mp4" />
        </video>
      `;
      const video = bottomContainer.querySelector('video');
      video.play().catch(e => console.log("Bottom video autoplay blocked:", e));
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
