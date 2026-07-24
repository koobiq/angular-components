import { DocsLocale } from '../constants/locale';

/**
 * Central catalog of the docs app's UI-chrome strings. Add a key here instead of inlining a
 * `{ ru, en }` literal or an `isRuLocale() ? … : …` ternary in a component (DOCS-I18N-01).
 *
 * NOTE: per-page prebuilt content HTML (loaded via `documentUrl`), the structure registry item
 * names, and mixed-markup blocks (callout body, "code example not found" paragraphs) are
 * intentionally NOT part of this dictionary.
 */
export const DOCS_TRANSLATIONS = {
    // Shared / clipboard
    copy: { ru: 'Скопировать', en: 'Copy' },
    copied: { ru: 'Скопировано', en: 'Copied' },

    // page-not-found
    pageNotFound: { ru: 'Страница не найдена', en: 'Page not found' },
    goToMainPage: { ru: 'Перейти на главную страницу', en: 'Go to main page' },

    // design token / typography tables
    token: { ru: 'Токен', en: 'Token' },
    value: { ru: 'Значение', en: 'Value' },
    typographyExample: { ru: 'Пример типографики', en: 'Typography Example' },
    cssClassName: { ru: 'Имя CSS-класса', en: 'CSS Class Name' },

    // design-tokens viewer (header + tabs)
    designTokens: { ru: 'Дизайн-токены', en: 'Design tokens' },
    tokensTabColors: { ru: 'Цвета', en: 'Colors' },
    tokensTabTypography: { ru: 'Типографика', en: 'Typography' },
    tokensTabShadows: { ru: 'Тени', en: 'Shadows' },
    tokensTabBorderRadius: { ru: 'Скругления', en: 'Border radius' },
    tokensTabSizes: { ru: 'Размеры', en: 'Sizes' },
    tokensTabPalette: { ru: 'Инженерная палитра', en: 'Engineer palette' },
    tokensTabSemantic: { ru: 'Семантическая палитра', en: 'Semantic palette' },

    // component viewer wrapper + tabs
    improvementSuggestions: { ru: 'Предложения по улучшению', en: 'Suggestions for improvement' },
    overviewTab: { ru: 'Обзор', en: 'Overview' },
    examplesTab: { ru: 'Примеры', en: 'Examples' },
    viewSourceOnGitHub: { ru: 'Исходный код', en: 'Source code' },

    // welcome page
    welcomeTitle: { ru: 'Дизайн-система Koobiq', en: 'Koobiq design system' },
    welcomeDescription: {
        ru: 'Набор принципов и инструментов для создания веб-приложений. Дизайн-система упрощает создание продуктов и обеспечивает единообразие их интерфейсов.',
        en: 'A set of principles and tools for creating web applications. The design system simplifies product development and ensures consistency across their interfaces.'
    },

    // icon preview modal
    iconColor: { ru: 'Цвет', en: 'Color' },
    downloadSvg: { ru: 'Скачать SVG', en: 'Download SVG' },
    copySvg: { ru: 'Скопировать SVG', en: 'Copy SVG' },
    iconSize: { ru: 'Размер', en: 'Size' },
    forMsWord: { ru: 'Для MS Word', en: 'For MS Word' },
    iconDescription: { ru: 'Описание', en: 'Description' },
    iconKeywords: { ru: 'Ключевые слова', en: 'Key words' },

    // example / live-example viewers
    loadingDocument: { ru: 'Загрузка документа...', en: 'Loading document...' },
    showExampleCode: { ru: 'Показать пример кода', en: 'Show example code' },
    hideExampleCode: { ru: 'Скрыть пример кода', en: 'Hide example code' },
    resetState: { ru: 'Сбросить состояние', en: 'Reset state' },

    // navbar theme switcher
    themeGroupHeader: { ru: 'ТЕМА', en: 'THEME' },
    themeSystem: { ru: 'Как в системе', en: 'Same as system' },
    themeLight: { ru: 'Светлая', en: 'Light' },
    themeDark: { ru: 'Тёмная', en: 'Dark' },

    // footer
    footerLanguageLabel: { ru: 'Язык интерфейса и примеров', en: 'Interface and examples language' },
    footerLanguageGroupHeader: { ru: 'ЯЗЫК', en: 'LANGUAGE' },
    footerInterface: { ru: 'Интерфейс', en: 'Interface' },
    footerExamples: { ru: 'Примеры', en: 'Examples' },
    footerVersionLabel: { ru: 'Версия', en: 'Version' },
    footerVersionGroupHeader: { ru: 'ВЕРСИЯ', en: 'VERSION' },
    footerVersionLatest: { ru: ' (последняя)', en: ' (latest)' },

    // icons viewer
    iconsTitle: { ru: 'Иконки', en: 'Icons' },
    iconNamePlaceholder: { ru: 'Название иконки', en: 'Icon name' },
    nothingFound: { ru: 'Ничего не найдено', en: 'Nothing found' }
} satisfies Record<string, Record<DocsLocale, string>>;

export type DocsTranslationKey = keyof typeof DOCS_TRANSLATIONS;

/** Resolves a translation key for the given locale. */
export const docsTranslate = (key: DocsTranslationKey, locale: DocsLocale): string => DOCS_TRANSLATIONS[key][locale];
