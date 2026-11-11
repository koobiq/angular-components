import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the dropdown-nested example. */
export interface ExampleText {
    columns: string;
    alignIntent: string;
    borderLines: string;
    bulletsNumbering: string;
    clearFormatting: string;
    headersFooters: string;
    image: string;
    lineSpacing: string;
    pageNumbers: string;
    paragraphStyles: string;
    table: string;
    normalText: string;
    subtitle: string;
    title: string;
    options: string;
    applyTitle: (title: string) => string;
    updateTitle: (title: string) => string;
    borderAndShading: string;
    searchSettings: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        columns: 'Колонки',
        alignIntent: 'Выравнивание и отступы',
        borderLines: 'Границы и линии',
        bulletsNumbering: 'Маркеры и нумерация',
        clearFormatting: 'Очистить форматирование',
        headersFooters: 'Колонтитулы',
        image: 'Изображение',
        lineSpacing: 'Межстрочный интервал',
        pageNumbers: 'Номера страниц',
        paragraphStyles: 'Стили абзаца',
        table: 'Таблица',
        normalText: 'Обычный текст',
        subtitle: 'Подзаголовок',
        title: 'Название',
        options: 'Параметры',
        applyTitle: (title) => `Применить «${title}»`,
        updateTitle: (title) => `Обновить «${title}» по стилю`,
        borderAndShading: 'Границы и заливка',
        searchSettings: 'Настройки поиска'
    },
    default: {
        columns: 'Columns',
        alignIntent: 'Align & intent',
        borderLines: 'Border & lines',
        bulletsNumbering: 'Bullets & numbering',
        clearFormatting: 'Clear formatting',
        headersFooters: 'Headers & footers',
        image: 'Image',
        lineSpacing: 'Line spacing',
        pageNumbers: 'Page numbers',
        paragraphStyles: 'Paragraph styles',
        table: 'Table',
        normalText: 'Normal text',
        subtitle: 'Subtitle',
        title: 'Title',
        options: 'Options',
        applyTitle: (title) => `Apply '${title}'`,
        updateTitle: (title) => `Update '${title}' to match style`,
        borderAndShading: 'Border and shading',
        searchSettings: 'Search settings'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
