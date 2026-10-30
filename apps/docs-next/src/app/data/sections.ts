import { DocsNextFramework, DocsNextText } from './site';

/** A page of a section. Without `framework` it exists for both frameworks. */
export interface DocsNextPage {
    id: string;
    title: DocsNextText;
    /** The only framework the page exists for. */
    framework?: DocsNextFramework;
    /** Whether the text differs between the frameworks. */
    dependent?: boolean;
    isNew?: boolean;
    isUpdated?: boolean;
    children?: DocsNextPage[];
}

export interface DocsNextGroup {
    title?: DocsNextText;
    pages: DocsNextPage[];
}

export interface DocsNextSection {
    id: string;
    title: DocsNextText;
    /** Sections built from data rather than a page list, such as components and icons, leave it empty. */
    groups: DocsNextGroup[];
}

const page = (id: string, ru: string, en: string, options: Partial<DocsNextPage> = {}): DocsNextPage => ({
    id,
    title: { ru, en },
    ...options
});

/** Sections of the main menu, in the order the spec fixes (spec/navigation/main-menu.md). */
export const DOCS_NEXT_SECTIONS: readonly DocsNextSection[] = [
    {
        id: 'development',
        title: { ru: 'Разработка', en: 'Development' },
        groups: [
            {
                title: { ru: 'Начало работы', en: 'Getting started' },
                pages: [
                    page('install', 'Установка', 'Installation', { dependent: true }),
                    page('theming', 'Темизация', 'Theming', { dependent: true, isUpdated: true }),
                    page('fonts', 'Шрифты', 'Fonts', { dependent: true }),
                    page('schematics', 'Схематики', 'Schematics', { framework: 'angular' }),
                    page('migrations', 'Миграции', 'Migrations', { dependent: true })
                ]
            },
            {
                title: { ru: 'Справочник', en: 'Reference' },
                pages: [
                    page('versioning', 'Версионирование', 'Versioning'),
                    page('core', 'Core', 'Core', { framework: 'angular' }),
                    page('dynamic-translation', 'Dynamic translation', 'Dynamic translation', { framework: 'angular' }),
                    page('formatter-date', 'Форматтер даты', 'Date formatter'),
                    page('formatter-number', 'Форматтер числа', 'Number formatter'),
                    page('formatter-file-size', 'Форматтер размера файла', 'File size formatter'),
                    page('icons-setup', 'Иконки', 'Icons', { dependent: true }),
                    page('localization', 'Локализация', 'Localization', { dependent: true }),
                    page('hooks', 'Хуки', 'Hooks', { framework: 'react', isNew: true })
                ]
            },
            {
                pages: [
                    page('agents', 'Для агентов', 'For agents', {
                        dependent: true,
                        children: [
                            page('llms-txt', 'LLMs.txt', 'LLMs.txt', { dependent: true }),
                            page('mcp-server', 'MCP-сервер', 'MCP server', { dependent: true }),
                            page('skills', 'Скиллы', 'Skills', { dependent: true }),
                            page('claude-plugin', 'Claude-плагин для Koobiq', 'Claude plugin for Koobiq')
                        ]
                    })
                ]
            }
        ]
    },
    {
        id: 'components',
        title: { ru: 'Компоненты', en: 'Components' },
        groups: []
    },
    {
        id: 'design',
        title: { ru: 'Дизайн', en: 'Design' },
        groups: [
            {
                title: { ru: 'Основы', en: 'Foundations' },
                pages: [
                    page('colors', 'Цвета', 'Colors'),
                    page('typography', 'Типографика', 'Typography'),
                    page('shadows', 'Тени', 'Shadows'),
                    page('border-radius', 'Скругление', 'Border radius'),
                    page('sizes', 'Размеры', 'Sizes'),
                    page('motion', 'Анимация', 'Motion'),
                    page('illustrations', 'Иллюстрации', 'Illustrations', { isNew: true })
                ]
            },
            {
                title: { ru: 'Контент', en: 'Content' },
                pages: [page('syntax', 'Синтаксис', 'Syntax'), page('wording', 'Формулировки', 'Wording')]
            },
            { pages: [page('generator', 'Генератор оформления', 'Theme generator')] }
        ]
    },
    {
        id: 'icons',
        title: { ru: 'Иконки', en: 'Icons' },
        groups: []
    },
    {
        id: 'patterns',
        title: { ru: 'Паттерны', en: 'Patterns' },
        groups: [
            {
                pages: [
                    page('form-validation', 'Валидация форм', 'Form validation', { dependent: true }),
                    page('page-loading', 'Загрузка страниц', 'Page loading', { dependent: true }),
                    page('smart-search', 'Умный поиск', 'Smart search', { dependent: true })
                ]
            }
        ]
    },
    {
        id: 'templates',
        title: { ru: 'Шаблоны', en: 'Templates' },
        groups: [
            {
                pages: [
                    page('table', 'Таблица', 'Table'),
                    page('fullscreen-form', 'Полноэкранная форма', 'Fullscreen form')
                ]
            }
        ]
    }
];

/** Existing MDX of the current site that a page of the prototype shows, `{locale}` standing for `ru` or `en`. */
export const DOCS_NEXT_GUIDE_SOURCES: Record<string, string> = {
    install: 'docs/guides/installation.{locale}.mdx',
    theming: 'docs/guides/theming.{locale}.mdx',
    schematics: 'docs/guides/schematics.{locale}.mdx',
    versioning: 'docs/guides/versioning.{locale}.mdx',
    localization: 'docs/guides/localization.{locale}.mdx',
    'smart-search': 'docs/guides/search-smart.{locale}.mdx',
    core: 'packages/components/core/core.{locale}.mdx',
    'dynamic-translation': 'packages/components/dynamic-translation/dynamic-translation.{locale}.mdx'
};

export const docsNextGetSection = (id: string): DocsNextSection | undefined =>
    DOCS_NEXT_SECTIONS.find((section) => section.id === id);

/** Pages of a section with the nested ones, in menu order. */
export const docsNextGetSectionPages = (section: DocsNextSection): DocsNextPage[] =>
    section.groups.flatMap(({ pages }) => pages.flatMap((item) => [item, ...(item.children ?? [])]));

export const docsNextIsAvailable = (item: { framework?: DocsNextFramework }, framework: DocsNextFramework): boolean =>
    !item.framework || item.framework === framework;
