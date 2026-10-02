import { useEffect, useState } from 'react';

// Injects the Google Website Translator once, hidden, and exposes EN/AR buttons.
function ensureGoogleTranslate() {
  if (window.__gtInjected) return;
  window.__gtInjected = true;

  // Hidden mount point Google needs.
  let el = document.getElementById('google_translate_element');
  if (!el) {
    el = document.createElement('div');
    el.id = 'google_translate_element';
    el.style.display = 'none';
    document.body.appendChild(el);
  }

  // Hide Google's top banner and stop it from pushing the page down.
  const style = document.createElement('style');
  style.textContent = `
    .goog-te-banner-frame, .skiptranslate iframe { display: none !important; }
    body { top: 0 !important; position: static !important; }
    #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }
    .goog-text-highlight { background: none !important; box-shadow: none !important; }
  `;
  document.head.appendChild(style);

  window.googleTranslateElementInit = function () {
    /* global google */
    new window.google.translate.TranslateElement(
      { pageLanguage: 'en', includedLanguages: 'en,ar', autoDisplay: false },
      'google_translate_element'
    );
  };

  const s = document.createElement('script');
  s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  s.async = true;
  document.body.appendChild(s);
}

// Drives the hidden Google language <select>. Retries until it has loaded.
function applyLanguage(lang, attempt = 0) {
  const select = document.querySelector('select.goog-te-combo');
  if (select) {
    select.value = lang;
    select.dispatchEvent(new Event('change'));
  } else if (attempt < 25) {
    setTimeout(() => applyLanguage(lang, attempt + 1), 250);
  }
}

export default function LanguageToggle() {
  const [lang, setLang] = useState('en');

  useEffect(() => { ensureGoogleTranslate(); }, []);

  function choose(next) {
    setLang(next);
    applyLanguage(next);
    document.documentElement.setAttribute('lang', next);
  }

  return (
    <div className="flex items-center rounded-lg border border-navy-100 overflow-hidden text-xs font-semibold notranslate">
      <button
        onClick={() => choose('en')}
        className={`px-2.5 py-1.5 transition ${lang === 'en' ? 'bg-navy-700 text-white' : 'text-navy-600 hover:bg-navy-50'}`}
      >
        EN
      </button>
      <button
        onClick={() => choose('ar')}
        className={`px-2.5 py-1.5 transition ${lang === 'ar' ? 'bg-navy-700 text-white' : 'text-navy-600 hover:bg-navy-50'}`}
      >
        ع
      </button>
    </div>
  );
}
