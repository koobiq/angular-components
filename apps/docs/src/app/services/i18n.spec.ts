import { DocsLocale } from '../constants/locale';
import { DOCS_TRANSLATIONS, docsTranslate } from './i18n';

/**
 * Value-lock for the i18n dictionary. The expected map below is transcribed from the components'
 * original inline `{ ru, en }` literals / ternaries, so migrating them to `t()` / `docsTranslate()`
 * cannot silently change a user-visible string. (End-to-end template wiring for the `t()` mechanism
 * is separately proven by the render tests in `i18n.characterization.spec.ts`.)
 */
describe('DOCS_TRANSLATIONS', () => {
    it('matches the exact strings previously inlined across the docs components', () => {
        expect(DOCS_TRANSLATIONS).toEqual({
            copy: { ru: 'Скопировать', en: 'Copy' },
            copied: { ru: 'Скопировано', en: 'Copied' },

            pageNotFound: { ru: 'Страница не найдена', en: 'Page not found' },
            goToMainPage: { ru: 'Перейти на главную страницу', en: 'Go to main page' },

            token: { ru: 'Токен', en: 'Token' },
            value: { ru: 'Значение', en: 'Value' },
            typographyExample: { ru: 'Пример типографики', en: 'Typography Example' },
            cssClassName: { ru: 'Имя CSS-класса', en: 'CSS Class Name' },

            designTokens: { ru: 'Дизайн-токены', en: 'Design tokens' },
            tokensTabColors: { ru: 'Цвета', en: 'Colors' },
            tokensTabTypography: { ru: 'Типографика', en: 'Typography' },
            tokensTabShadows: { ru: 'Тени', en: 'Shadows' },
            tokensTabBorderRadius: { ru: 'Скругления', en: 'Border radius' },
            tokensTabSizes: { ru: 'Размеры', en: 'Sizes' },
            tokensTabPalette: { ru: 'Инженерная палитра', en: 'Engineer palette' },
            tokensTabSemantic: { ru: 'Семантическая палитра', en: 'Semantic palette' },

            improvementSuggestions: { ru: 'Предложения по улучшению', en: 'Suggestions for improvement' },
            overviewTab: { ru: 'Обзор', en: 'Overview' },
            examplesTab: { ru: 'Примеры', en: 'Examples' },
            viewSourceOnGitHub: { ru: 'Исходный код', en: 'Source code' },

            welcomeTitle: { ru: 'Дизайн-система Koobiq', en: 'Koobiq design system' },
            welcomeDescription: {
                ru: 'Набор принципов и инструментов для создания веб-приложений. Дизайн-система упрощает создание продуктов и обеспечивает единообразие их интерфейсов.',
                en: 'A set of principles and tools for creating web applications. The design system simplifies product development and ensures consistency across their interfaces.'
            },

            iconColor: { ru: 'Цвет', en: 'Color' },
            downloadSvg: { ru: 'Скачать SVG', en: 'Download SVG' },
            copySvg: { ru: 'Скопировать SVG', en: 'Copy SVG' },
            iconSize: { ru: 'Размер', en: 'Size' },
            forMsWord: { ru: 'Для MS Word', en: 'For MS Word' },
            iconDescription: { ru: 'Описание', en: 'Description' },
            iconKeywords: { ru: 'Ключевые слова', en: 'Key words' },

            loadingDocument: { ru: 'Загрузка документа...', en: 'Loading document...' },
            showExampleCode: { ru: 'Показать пример кода', en: 'Show example code' },
            hideExampleCode: { ru: 'Скрыть пример кода', en: 'Hide example code' },
            resetState: { ru: 'Сбросить состояние', en: 'Reset state' },

            themeGroupHeader: { ru: 'ТЕМА', en: 'THEME' },
            themeSystem: { ru: 'Как в системе', en: 'Same as system' },
            themeLight: { ru: 'Светлая', en: 'Light' },
            themeDark: { ru: 'Тёмная', en: 'Dark' },

            footerLanguageLabel: { ru: 'Язык интерфейса и примеров', en: 'Interface and examples language' },
            footerLanguageGroupHeader: { ru: 'ЯЗЫК', en: 'LANGUAGE' },
            footerInterface: { ru: 'Интерфейс', en: 'Interface' },
            footerExamples: { ru: 'Примеры', en: 'Examples' },
            footerVersionLabel: { ru: 'Версия', en: 'Version' },
            footerVersionGroupHeader: { ru: 'ВЕРСИЯ', en: 'VERSION' },
            footerVersionLatest: { ru: ' (последняя)', en: ' (latest)' },

            iconsTitle: { ru: 'Иконки', en: 'Icons' },
            iconNamePlaceholder: { ru: 'Название иконки', en: 'Icon name' },
            nothingFound: { ru: 'Ничего не найдено', en: 'Nothing found' }
        });
    });

    it('resolves a key for the requested locale', () => {
        expect(docsTranslate('copy', DocsLocale.Ru)).toBe('Скопировать');
        expect(docsTranslate('copy', DocsLocale.En)).toBe('Copy');
    });
});
