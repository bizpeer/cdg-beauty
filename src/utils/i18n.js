import translations from '../locales/translation.json';

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('lang') || 'en';
    this.updateLanguageElements();
  }

  setLanguage(lang) {
    if (translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('lang', lang);
      this.updateLanguageElements();
      // Dispatch event for other components to listen
      window.dispatchEvent(new CustomEvent('langChange', { detail: { lang } }));
    }
  }

  t(keyPath) {
    const keys = keyPath.split('.');
    let result = translations[this.currentLang];
    for (const key of keys) {
      if (result[key]) {
        result = result[key];
      } else {
        return keyPath; // Fallback to key path if not found
      }
    }
    return result;
  }

  updateLanguageElements() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.innerText = this.t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });
    
    document.documentElement.lang = this.currentLang;
  }
}

export const i18n = new I18nManager();
