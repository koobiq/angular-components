export enum DocsLocale {
    En = 'en',
    Ru = 'ru'
}

export const DOCS_DEFAULT_LOCALE = DocsLocale.Ru;

export const DOCS_SUPPORTED_LOCALES = Object.values<string>(DocsLocale);

/** Query param carrying the picked examples language, e.g. `?examples-lang=ru-RU`. */
export const DOCS_EXAMPLES_LANG_PARAM = 'examples-lang';
