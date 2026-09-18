import { DocsLocale } from '../constants/locale';

/**
 * Central catalog of the docs app's localized strings. Add a key here instead of inlining a
 * `{ ru, en }` literal or an `isRuLocale() ? … : …` ternary in application code (DOCS-I18N-01).
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
    tokensTabPlayground: { ru: 'Песочница', en: 'Playground' },

    // design tokens playground
    playgroundIntro: {
        ru: 'Каждая настройка переписывает только слой semantic.* — всё, что ниже, не трогается. Именно ради этого семантическая палитра существует отдельно от инженерной: перекраска — это правка одного слоя, а не поиск по всем.',
        en: 'Every control here rewrites only the semantic.* layer — nothing downstream is touched. That is why the semantic palette exists separately from the engineering one: re-theming is a change to a single layer, not a search across all of them.'
    },
    playgroundPalette: { ru: 'Палитра', en: 'Palette' },
    playgroundShape: { ru: 'Форма', en: 'Shape' },
    playgroundBorderRadius: { ru: 'Скругление', en: 'Border radius' },
    playgroundReset: { ru: 'Сбросить', en: 'Reset' },
    playgroundCopyPatch: { ru: 'Скопировать патч', en: 'Copy patch' },
    playgroundChain: { ru: 'Цепочка ссылок', en: 'Reference chain' },
    playgroundChainHint: {
        ru: 'Нажмите на любой компонент или образец цвета, чтобы проследить цепочку.',
        en: 'Click any component or swatch to trace its chain.'
    },
    playgroundFamilyTheme: { ru: 'Бренд (theme)', en: 'Brand (theme)' },
    playgroundFamilyContrast: { ru: 'Контраст (contrast)', en: 'Contrast' },
    playgroundFamilyError: { ru: 'Ошибка (error)', en: 'Error' },
    playgroundFamilySuccess: { ru: 'Успех (success)', en: 'Success' },
    playgroundFamilyWarning: { ru: 'Предупреждение (warning)', en: 'Warning' },
    playgroundFamilyVisited: { ru: 'Посещённые ссылки (visited)', en: 'Visited links' },
    playgroundSectionControls: { ru: 'Управление', en: 'Controls' },
    playgroundSectionForms: { ru: 'Поля ввода', en: 'Form fields' },
    playgroundSectionStatus: { ru: 'Статусы', en: 'Status' },
    playgroundSectionElevation: { ru: 'Тени', en: 'Elevation' },
    playgroundSectionRamps: { ru: 'Семантические шкалы', en: 'Semantic ramps' },
    playgroundRampsHint: {
        ru: 'Шкалы следуют активной теме: в тёмной показаны семейства dark*.',
        en: 'Ramps follow the active theme — the dark* families are shown in dark mode.'
    },
    playgroundPrimary: { ru: 'Основная', en: 'Primary' },
    playgroundSecondary: { ru: 'Вторичная', en: 'Secondary' },
    playgroundThemeButton: { ru: 'Брендовая', en: 'Theme' },
    playgroundThemeFadeButton: { ru: 'Брендовая блёклая', en: 'Theme fade' },
    playgroundDisabled: { ru: 'Недоступна', en: 'Disabled' },
    playgroundCheckbox: { ru: 'Чекбокс', en: 'Checkbox' },
    playgroundToggle: { ru: 'Переключатель', en: 'Toggle' },
    playgroundRadioOne: { ru: 'Первый', en: 'First' },
    playgroundRadioTwo: { ru: 'Второй', en: 'Second' },
    playgroundLink: { ru: 'Ссылка', en: 'A link' },
    playgroundInputValue: { ru: 'Значение поля', en: 'Input value' },
    playgroundInputError: { ru: 'Заполните поле', en: 'This field is required' },
    playgroundAlertError: { ru: 'Что-то пошло не так.', en: 'Something went wrong.' },
    playgroundAlertSuccess: { ru: 'Сохранено.', en: 'Saved.' },
    playgroundAlertWarning: { ru: 'Проверьте перед продолжением.', en: 'Check this before continuing.' },

    // component viewer wrapper + tabs
    improvementSuggestions: { ru: 'Предложения по улучшению', en: 'Suggestions for improvement' },
    overviewTab: { ru: 'Обзор', en: 'Overview' },
    apiTab: { ru: 'API', en: 'API' },
    examplesTab: { ru: 'Примеры', en: 'Examples' },
    viewSourceOnGitHub: { ru: 'Исходный код', en: 'Source code' },

    // migration guide
    migrationFrom: { ru: 'С', en: 'From' },
    migrationFromLabel: { ru: 'С версии', en: 'From version' },
    migrationTo: { ru: 'На', en: 'To' },
    migrationToLabel: { ru: 'На версию', en: 'To version' },
    migrationComponents: { ru: 'Используемые компоненты', en: 'Components you use' },
    migrationComponentsSearch: { ru: 'Поиск компонента', en: 'Search components' },
    migrationUnreleased: { ru: 'ещё не выпущена', en: 'not released yet' },
    migrationStepDone: { ru: 'Выполнено', en: 'Done' },
    migrationPickPrompt: { ru: 'Укажите, с какой версии обновляетесь', en: 'Pick the version you are upgrading from' },
    migrationCommandsTitle: { ru: 'Команды обновления', en: 'Update commands' },
    migrationOneMajorAtATime: {
        ru: 'ng update не перепрыгивает через мажорную версию: выполните команду и шаги одной версии, прежде чем переходить к следующей.',
        en: 'ng update cannot skip a major version: run each command and take the steps of that version before moving on to the next.'
    },
    migrationNothingTitle: { ru: 'Ломающих изменений нет', en: 'No breaking changes' },
    migrationNothingText: {
        ru: 'Обновите пакеты командами выше — больше ничего делать не нужно.',
        en: 'Update the packages with the commands above; there is nothing else to do.'
    },

    // welcome page
    welcomeTitle: { ru: 'Дизайн-система Koobiq', en: 'Koobiq design system' },
    welcomeDescription: {
        ru: 'Набор принципов и инструментов для создания веб-приложений. Дизайн-система упрощает создание продуктов и обеспечивает единообразие их интерфейсов.',
        en: 'A set of principles and tools for creating web applications. The design system simplifies product development and ensures consistency across their interfaces.'
    },

    // SEO
    seoSiteDescription: {
        ru: 'Koobiq — библиотека компонентов и дизайн-система для Angular.',
        en: 'Koobiq — Angular components library and design system.'
    },
    seoHomeTitle: {
        ru: 'Koobiq — дизайн-система для Angular',
        en: 'Koobiq — Angular design system'
    },
    seoIconsDescription: {
        ru: 'Каталог иконок дизайн-системы Koobiq с поиском и вариантами использования.',
        en: 'Koobiq design system icon catalog with search and usage options.'
    },
    seoFallbackImageAlt: {
        ru: 'Иллюстрация дизайн-системы Koobiq',
        en: 'Koobiq design system illustration'
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
    showExampleCode: { ru: 'Показать код', en: 'Show code' },
    hideExampleCode: { ru: 'Скрыть код', en: 'Hide code' },
    resetState: { ru: 'Сбросить состояние', en: 'Reset state' },
    enterFullscreen: { ru: 'На весь экран', en: 'Enter full screen' },
    exitFullscreen: { ru: 'Выйти из полноэкранного режима', en: 'Exit full screen' },
    openInNewTab: { ru: 'Открыть в новой вкладке', en: 'Open in new tab' },

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
    iconsAccentColorFilter: { ru: 'Только двухцветные', en: 'Two-color only' },
    nothingFound: { ru: 'Ничего не найдено', en: 'Nothing found' }
} satisfies Record<string, Record<DocsLocale, string>>;

export type DocsTranslationKey = keyof typeof DOCS_TRANSLATIONS;

/** Resolves a translation key for the given locale. */
export const docsTranslate = (key: DocsTranslationKey, locale: DocsLocale): string => DOCS_TRANSLATIONS[key][locale];

export const DOCS_TRANSLATION_TEMPLATES = {
    seoImageAlt: {
        ru: (name: string) => `${name} — документация Koobiq`,
        en: (name: string) => `${name} — Koobiq documentation`
    },
    seoApiDescription: {
        ru: (name: string) => `API ${name} в Koobiq: свойства, события, методы и связанные типы.`,
        en: (name: string) => `Koobiq ${name} API: properties, events, methods, and related types.`
    },
    seoExamplesDescription: {
        ru: (name: string) => `Примеры использования ${name} в Angular-приложениях с дизайн-системой Koobiq.`,
        en: (name: string) => `Examples of using ${name} in Angular applications with the Koobiq design system.`
    },
    seoTokensDescription: {
        ru: (name: string) => `${name}: дизайн-токены Koobiq для создания согласованных интерфейсов.`,
        en: (name: string) => `${name}: Koobiq design tokens for building consistent interfaces.`
    },
    seoItemDescription: {
        ru: (name: string) => `Документация по ${name} в дизайн-системе Koobiq для Angular.`,
        en: (name: string) => `${name} documentation for the Koobiq Angular design system.`
    }
} satisfies Record<string, Record<DocsLocale, (value: string) => string>>;

export type DocsTranslationTemplateKey = keyof typeof DOCS_TRANSLATION_TEMPLATES;

/** Resolves a parameterized translation for the given locale. */
export const docsTranslateTemplate = (key: DocsTranslationTemplateKey, locale: DocsLocale, value: string): string =>
    DOCS_TRANSLATION_TEMPLATES[key][locale](value);

/** The migration guide's title for a picked range. Kept apart: it takes two values, the templates one. */
export const DOCS_MIGRATION_RANGE_TITLE: Record<DocsLocale, (from: string, to: string) => string> = {
    ru: (from, to) => `Обновление с ${from} на ${to}`,
    en: (from, to) => `Upgrading from ${from} to ${to}`
};

/** How many of the migration steps on screen the reader has marked done. */
export const DOCS_MIGRATION_PROGRESS_LABEL: Record<DocsLocale, (done: number, total: number) => string> = {
    ru: (done, total) => `Выполнено ${done} из ${total}`,
    en: (done, total) => `${done} of ${total} done`
};
