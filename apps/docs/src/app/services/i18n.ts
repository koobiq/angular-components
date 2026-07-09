import { DocsLocale } from '../constants/locale';

/**
 * Central catalog of the docs app's UI-chrome strings. Add a key here instead of inlining a
 * `{ ru, en }` literal or an `isRuLocale() ? … : …` ternary in a component (DOCS-I18N-01).
 *
 * NOTE: per-page prebuilt content HTML (loaded via `documentUrl`) is intentionally NOT part of this
 * dictionary — that content is already authored per locale.
 */
export const DOCS_TRANSLATIONS = {
    pageNotFound: { ru: 'Страница не найдена', en: 'Page not found' },
    goToMainPage: { ru: 'Перейти на главную страницу', en: 'Go to main page' },
    copy: { ru: 'Скопировать', en: 'Copy' },
    copied: { ru: 'Скопировано', en: 'Copied' }
} satisfies Record<string, Record<DocsLocale, string>>;

export type DocsTranslationKey = keyof typeof DOCS_TRANSLATIONS;

/** Resolves a translation key for the given locale. */
export const docsTranslate = (key: DocsTranslationKey, locale: DocsLocale): string => DOCS_TRANSLATIONS[key][locale];
