import fs from 'fs';
import path from 'path';

const assetsDir = path.join(process.cwd(), 'public/assets/images');
const videoDir = path.join(process.cwd(), 'public/assets/videos');

if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

const createSVG = (text, bgColor, textColor = 'white') => `
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="${textColor}" dominant-baseline="middle" text-anchor="middle">
    ${text}
  </text>
  <path d="M50 85c-1.5 0-3-.5-4.2-1.5-12-9.6-22.3-19.5-28.5-27.4-6.4-8.2-9-15.3-7.6-21.2 1.9-8 8.4-14.1 16-15.2 6.4-1 12.8 1.6 17.5 6.8 2.8 3.1 4.5 6.7 5 7.1.5-.4 2.2-4 5-7.1 4.7-5.2 11.1-7.8 17.5-6.8 7.6 1.1 14.1 7.2 16 15.2 1.4 5.9-1.2 13-7.6 21.2-6.2 7.9-16.5 17.8-28.5 27.4-1.2 1-2.7 1.5-4.2 1.5z" fill="rgba(255,255,255,0.2)" transform="translate(150, 250) scale(0.5)"/>
</svg>
`;

const products = [
    // Hero
    { name: 'hero-product.jpg', text: 'Hero Visual\nCDG Cosmetic', color: '#E60012' },
    { name: 'cdg-logo.svg', text: 'CDG', color: 'transparent', isLogo: true },
    { name: 'model-face.jpg', text: 'Model Visual\n(Interactive Area)', color: '#f0f0f0', textColor: '#333' },

    // Skin
    { name: 'skin-1.jpg', text: 'Toner', color: '#f8f9fa', textColor: '#333' },
    { name: 'skin-2.jpg', text: 'Emulsion', color: '#e9ecef', textColor: '#333' },
    { name: 'skin-3.jpg', text: 'Serum Alpha', color: '#dee2e6', textColor: '#333' },
    { name: 'skin-4.jpg', text: 'Serum Beta', color: '#ced4da', textColor: '#333' },
    { name: 'skin-5.jpg', text: 'Serum Gamma', color: '#adb5bd', textColor: '#333' },
    { name: 'skin-6.jpg', text: 'Cream Light', color: '#6c757d', textColor: '#fff' },
    { name: 'skin-7.jpg', text: 'Cream Rich', color: '#495057', textColor: '#fff' },
    { name: 'skin-8.jpg', text: 'Cleanser', color: '#343a40', textColor: '#fff' },
    { name: 'skin-9.jpg', text: 'Sun Guard', color: '#212529', textColor: '#fff' },
    { name: 'skin-10.jpg', text: 'Heart Mask', color: '#E60012', textColor: '#fff' },

    // Textures (Generic)
    { name: 'texture-1.jpg', text: 'Water Texture', color: '#e3f2fd', textColor: '#0d47a1' },
    { name: 'texture-2.jpg', text: 'Milky Texture', color: '#fff3e0', textColor: '#e65100' },
    { name: 'texture-3.jpg', text: 'Serum Drop', color: '#e8f5e9', textColor: '#1b5e20' },
    { name: 'texture-4.jpg', text: 'Gel Texture', color: '#f3e5f5', textColor: '#4a148c' },
    { name: 'texture-5.jpg', text: 'Oil Texture', color: '#fff8e1', textColor: '#f57f17' },
    { name: 'texture-6.jpg', text: 'Cream Texture', color: '#eceff1', textColor: '#263238' },
    { name: 'texture-7.jpg', text: 'Balm Texture', color: '#fffde7', textColor: '#f9a825' },
    { name: 'texture-8.jpg', text: 'Foam Texture', color: '#e0f7fa', textColor: '#006064' },
    { name: 'texture-9.jpg', text: 'Lotion Texture', color: '#f1f8e9', textColor: '#33691e' },
    { name: 'texture-10.jpg', text: 'Mask Sheet', color: '#ffebee', textColor: '#b71c1c' },

    // Color
    { name: 'color-1.jpg', text: 'Signature Red', color: '#E60012' },
    { name: 'color-2.jpg', text: 'Playful Pink', color: '#FF748C' },
    { name: 'color-3.jpg', text: 'Orange Heart', color: '#FF4D00' },
    { name: 'color-4.jpg', text: 'Misty Rose', color: '#C88D8D' },
    { name: 'color-5.jpg', text: 'Deep Burgundy', color: '#800000' }
];

products.forEach(p => {
    let content;
    if (p.isLogo) {
        content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 85c-1.5 0-3-.5-4.2-1.5-12-9.6-22.3-19.5-28.5-27.4-6.4-8.2-9-15.3-7.6-21.2 1.9-8 8.4-14.1 16-15.2 6.4-1 12.8 1.6 17.5 6.8 2.8 3.1 4.5 6.7 5 7.1.5-.4 2.2-4 5-7.1 4.7-5.2 11.1-7.8 17.5-6.8 7.6 1.1 14.1 7.2 16 15.2 1.4 5.9-1.2 13-7.6 21.2-6.2 7.9-16.5 17.8-28.5 27.4-1.2 1-2.7 1.5-4.2 1.5z" fill="#E60012"/></svg>`;
        fs.writeFileSync(path.join(assetsDir, p.name), content);
    } else {
        content = createSVG(p.text, p.color, p.textColor);
        // Save as .jpg filename but content is SVG (browser will handle or we should rename)
        // Ideally save as .svg, but code references .jpg. 
        // Modern browsers often render SVG in img src even with wrong ext, or we update code.
        // Let's safe: update products.js to .svg IS BETTER.
        // BUT user asked to fix display. I will generate .svg and update products.js to .svg
        const svgName = p.name.replace('.jpg', '.svg');
        fs.writeFileSync(path.join(assetsDir, svgName), content);
    }
});

console.log('SVG Assets generated.');
