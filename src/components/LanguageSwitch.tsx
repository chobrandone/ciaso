'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';

type Lang = 'en' | 'fr';
type GoogleWindow = Window & {
  googleTranslateElementInit?: () => void;
  google?: { translate: { TranslateElement: new (opts: object, id: string) => unknown } };
  __ciasoTranslate?: boolean;
};

const readLang = (): Lang => (/(^|;\s*)googtrans=\/[a-z-]+\/fr/i.test(document.cookie) ? 'fr' : 'en');

/** Google Translate reads the "googtrans" cookie (/en/fr); it may live on the host or the parent domain. */
function setLangCookie(lang: Lang) {
  const host = location.hostname;
  const domains = ['', host, `.${host.split('.').slice(-2).join('.')}`];
  for (const d of domains) {
    const domain = d ? `; domain=${d}` : '';
    document.cookie = lang === 'fr'
      ? `googtrans=/en/fr; path=/; max-age=31536000; SameSite=Lax${domain}`
      : `googtrans=; path=/; max-age=0${domain}`;
  }
}

/**
 * Google Translate rewrites text nodes, which can make React fail when it later removes or moves them.
 * Make those two DOM calls tolerant of nodes Google has already replaced.
 */
function patchDomForTranslation() {
  const proto = Node.prototype as Node & Record<string, unknown>;
  if (proto.__ciasoPatched) return;
  proto.__ciasoPatched = true;
  const removeChild = proto.removeChild;
  proto.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child) as T;
  };
  const insertBefore = proto.insertBefore;
  proto.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return insertBefore.call(this, node, null) as T;
    return insertBefore.call(this, node, ref) as T;
  };
}

/** Loads the Google Translate widget once; it translates the page into French as soon as it starts. */
function loadGoogleTranslate() {
  const w = window as GoogleWindow;
  if (w.__ciasoTranslate) return;
  w.__ciasoTranslate = true;
  patchDomForTranslation();
  const host = document.createElement('div');
  host.id = 'google_translate_element';
  host.hidden = true;
  document.body.appendChild(host);
  w.googleTranslateElementInit = () => {
    new w.google!.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'en,fr', autoDisplay: false }, 'google_translate_element');
  };
  const s = document.createElement('script');
  s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  s.async = true;
  document.body.appendChild(s);
}

/** English / Français switch. English visitors never load anything from Google. */
export default function LanguageSwitch({ className }: { className?: string }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const l = readLang();
    setLang(l);
    if (l === 'fr') loadGoogleTranslate();
  }, []);

  const toggle = () => {
    const next: Lang = lang === 'fr' ? 'en' : 'fr';
    setLangCookie(next);
    location.reload();
  };

  return (
    <button type="button" className={`lang-switch${className ? ` ${className}` : ''}`} onClick={toggle} translate="no"
      lang={lang === 'fr' ? 'en' : 'fr'} aria-label={lang === 'fr' ? 'View this website in English' : 'Voir ce site en français (traduction automatique)'}>
      <Icon name="globe" />{lang === 'fr' ? 'English' : 'Français'}
    </button>
  );
}
