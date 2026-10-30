export type DocsNextLocale = 'ru' | 'en';

export type DocsNextFramework = 'angular' | 'react';

export type DocsNextText = Record<DocsNextLocale, string>;

export const DOCS_NEXT_LOCALES: readonly DocsNextLocale[] = ['ru', 'en'];

export const DOCS_NEXT_FRAMEWORKS: readonly { id: DocsNextFramework; title: string }[] = [
    { id: 'angular', title: 'Angular' },
    { id: 'react', title: 'React' }
];

export const docsNextIsLocale = (value: unknown): value is DocsNextLocale =>
    DOCS_NEXT_LOCALES.includes(value as DocsNextLocale);

export const docsNextIsFramework = (value: unknown): value is DocsNextFramework =>
    value === 'angular' || value === 'react';

export const docsNextFrameworkTitle = (framework: DocsNextFramework): string =>
    framework === 'angular' ? 'Angular' : 'React';

/** Below 720px the site switches to its phone layout (spec/navigation/mobile.md). */
export const DOCS_NEXT_MOBILE_QUERY = '(max-width: 719.98px)';

/** The short label of a version on a phone: `Next` or the major number. */
export const docsNextVersionShortTitle = (id: string): string => (id === 'next' ? 'Next' : id);

export interface DocsNextVersion {
    /** Major number, or `next`; the spec puts it in the address later on. */
    id: string;
    title: string;
    group: 'next' | 'current' | 'previous';
    /** Long-term support, marked LTS in the version menu. */
    lts?: boolean;
}

/** Versions from the newest to the oldest (spec/context/version.md). The current one is the default. */
export const DOCS_NEXT_VERSIONS: readonly DocsNextVersion[] = [
    { id: 'next', title: '21.0.0-next', group: 'next' },
    { id: '20', title: '20.4.1', group: 'current' },
    { id: '19', title: '19.7.3', group: 'previous' },
    { id: '18', title: '18.30.2', group: 'previous' }
];

/**
 * The version list with `count` versions, a service switch to try the tiles of the phone sheet (`?versions=N`): one
 * means the current version alone, more add Next and then the older majors.
 */
export const docsNextVersionsOfCount = (count: number): readonly DocsNextVersion[] => {
    if (count === 1) return DOCS_NEXT_VERSIONS.filter(({ group }) => group === 'current');

    const current = Number(DOCS_NEXT_VERSIONS.find(({ group }) => group === 'current')!.id);

    return Array.from(
        { length: count },
        (_, index): DocsNextVersion =>
            DOCS_NEXT_VERSIONS[index] ?? {
                id: String(current - index + 1),
                title: `${current - index + 1}.0.0`,
                group: 'previous'
            }
    );
};

/** Smallest width of a version tile on a phone and the gap between tiles (Figma: Version, Framework, 73:36420). */
export const DOCS_NEXT_VERSION_TILE = { minWidth: 64, gap: 8 };

/**
 * How many version tiles each row of the phone sheet holds (Figma: Version, Framework, 73:36420). Up to three share a
 * row; otherwise Next and the current version open the first row and the older ones go below. Before another row is
 * added, the first row takes what the rows below can't hold; the rest is spread evenly, longer rows first.
 */
export const docsNextVersionRows = (count: number, perRow: number): number[] => {
    const capacity = Math.max(2, perRow);

    if (count <= 3) return count ? [count] : [];

    const rows = Math.max(2, Math.ceil(count / capacity));
    const first = Math.max(2, count - (rows - 1) * capacity);
    const rest = count - first;
    const below = rows - 1;

    return [
        first,
        ...Array.from({ length: below }, (_, index) => Math.floor(rest / below) + (index < rest % below ? 1 : 0))
    ];
};

/** Interface strings of the site. */
export const DOCS_NEXT_I18N = {
    search: { ru: 'Поиск', en: 'Search' },
    searchPlaceholder: { ru: 'Поиск по документации', en: 'Search the docs' },
    searchEmpty: {
        ru: 'Поиск появится на следующих этапах. Сейчас это только окно.',
        en: 'Search comes in a later stage. For now this is just the dialog.'
    },
    language: { ru: 'Язык', en: 'Language' },
    theme: { ru: 'Тема', en: 'Theme' },
    themeAuto: { ru: 'Системная', en: 'System' },
    themeLight: { ru: 'Светлая', en: 'Light' },
    themeDark: { ru: 'Тёмная', en: 'Dark' },
    version: { ru: 'Версия', en: 'Version' },
    framework: { ru: 'Фреймворк', en: 'Framework' },
    frameworkOrLibrary: { ru: 'Фреймворк или библиотека', en: 'Framework or library' },
    more: { ru: 'Ещё', en: 'More' },
    menu: { ru: 'Меню', en: 'Menu' },
    close: { ru: 'Закрыть', en: 'Close' },
    back: { ru: 'Назад', en: 'Back' },
    versionActive: { ru: 'Актуальная', en: 'Active' },
    versionAndFramework: { ru: 'Версия и фреймворк', en: 'Version and framework' },
    menuVariant: { ru: 'Вид меню', en: 'Menu layout' },
    menuLevels: { ru: 'Уровни', en: 'Levels' },
    menuAccordion: { ru: 'Аккордеоны', en: 'Accordions' },
    mainMenu: { ru: 'Разделы', en: 'Sections' },
    sectionMenu: { ru: 'Меню раздела', en: 'Section menu' },
    toMainPage: { ru: 'На главную', en: 'Home' },
    onThisPage: { ru: 'На этой странице', en: 'On this page' },
    expandArticle: { ru: 'Развернуть статью', en: 'Expand the article' },
    allComponents: { ru: 'Все компоненты', en: 'All components' },
    isNew: { ru: 'Новое', en: 'New' },
    isUpdated: { ru: 'Обновлено', en: 'Updated' },
    overview: { ru: 'Обзор', en: 'Overview' },
    content: { ru: 'Контент', en: 'Content' },
    api: { ru: 'API', en: 'API' },
    examples: { ru: 'Примеры', en: 'Examples' },
    copyPage: { ru: 'Скопировать', en: 'Copy' },
    copied: { ru: 'Скопировано', en: 'Copied' },
    pageActions: { ru: 'Другие действия со страницей', en: 'More page actions' },
    viewMarkdown: { ru: 'Посмотреть как Markdown', en: 'View as Markdown' },
    addToCursor: { ru: 'Добавить в Cursor', en: 'Add to Cursor' },
    addToVsCode: { ru: 'Добавить в VS Code', en: 'Add to VS Code' },
    openInClaude: { ru: 'Открыть в Claude', en: 'Open in Claude' },
    openInChatGpt: { ru: 'Открыть в ChatGPT', en: 'Open in ChatGPT' },
    codeOnGithub: { ru: 'Код на GitHub', en: 'Code on GitHub' },
    showCode: { ru: 'Показать код', en: 'Show code' },
    hideCode: { ru: 'Скрыть', en: 'Hide' },
    copyCode: { ru: 'Скопировать код', en: 'Copy code' },
    reload: { ru: 'Перезапустить', en: 'Reload' },
    expand: { ru: 'Развернуть', en: 'Expand' },
    openInNewTab: { ru: 'Открыть в новой вкладке', en: 'Open in a new tab' },
    examplePlaceholder: {
        ru: 'Живой пример подключим на этапе 4',
        en: 'The live example arrives in stage 4'
    },
    loading: { ru: 'Загрузка…', en: 'Loading…' },
    placeholderText: {
        ru: 'Статьи пока нет: здесь будет текст раздела. На этапе прототипа страница показывает структуру.',
        en: 'There is no article yet: the text of the page goes here. The prototype shows the structure only.'
    },
    reactArticleNote: {
        ru: 'Статьи для React пока нет: показан общий текст из документации Angular.',
        en: 'There is no React article yet: this is the shared text from the Angular docs.'
    },
    stubTitle: { ru: 'Скоро будет', en: 'Coming soon' },
    stubText: {
        ru: '{name} пока нет для {framework}. Компонент скоро появится. Сейчас он есть только для {other}.',
        en: '{name} is not available for {framework} yet. It is coming soon. For now it exists for {other} only.'
    },
    stubCreateIssue: { ru: 'Создать issue на GitHub', en: 'Create an issue on GitHub' },
    stubStorybook: { ru: 'Открыть Storybook React', en: 'Open the React Storybook' },
    onlyFor: {
        ru: 'Эта страница есть только для {framework}. Переключите фреймворк в шапке.',
        en: 'This page exists for {framework} only. Switch the framework in the header.'
    },
    redirectedNotice: {
        ru: 'Страницы «{page}» нет для {framework}, открыта первая страница раздела «{section}».',
        en: 'There is no “{page}” page for {framework}; the first page of “{section}” is open.'
    },
    contentPlaceholder: {
        ru: 'Правила текста для компонента в формате «делать / не делать». Раздел новый, тексты появятся позже.',
        en: 'Text guidelines for the component as do’s and don’ts. The section is new, the texts come later.'
    },
    examplesPlaceholder: {
        ru: 'Примеры пока показаны во вкладке «Обзор». Отдельную вкладку наполним на следующих этапах.',
        en: 'For now the examples are in the Overview tab. This tab gets its content in a later stage.'
    },
    apiPlaceholder: {
        ru: 'API переносится с текущего сайта как есть. В прототипе — пример оформления таблицы.',
        en: 'The API moves over from the current site as is. The prototype shows how the table looks.'
    },
    componentsLead: {
        ru: 'Компоненты Koobiq. Серым — те, которых пока нет для {framework}.',
        en: 'Koobiq components. Greyed out are the ones not yet available for {framework}.'
    },
    homeTitle: { ru: 'Koobiq', en: 'Koobiq' },
    homeLead: {
        ru: 'Дизайн-система Koobiq для Angular и React. Фреймворк и версия переключаются в шапке.',
        en: 'The Koobiq design system for Angular and React. Switch the framework and version in the header.'
    },
    iconsPlaceholder: {
        ru: 'Галерея значков появится на этапе 3.',
        en: 'The icon gallery arrives in stage 3.'
    },
    notFound: { ru: 'Страница не найдена', en: 'Page not found' }
} satisfies Record<string, DocsNextText>;

export type DocsNextI18nKey = keyof typeof DOCS_NEXT_I18N;

/** Fills `{name}` placeholders of a string. */
export const docsNextFormat = (text: string, values: Record<string, string>): string =>
    text.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
