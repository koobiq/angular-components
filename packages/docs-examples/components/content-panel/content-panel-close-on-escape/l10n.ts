import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the close-on-escape example. */
export interface ExampleTranslation {
    openTooltip: string;
    open: string;
    title: string;
    escapeHint: string;
    selectHint: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        openTooltip: 'Открывает панель',
        open: 'Открыть',
        title: 'Заголовок',
        escapeHint: 'Нажмите Escape в любом месте страницы.',
        selectHint: 'Escape сначала закрывает открытый список, а следующее нажатие закроет панель.'
    },
    default: {
        openTooltip: 'Opens the panel',
        open: 'Open',
        title: 'Title',
        escapeHint: 'Press Escape anywhere on the page.',
        selectHint: 'Escape closes an open select first, and the panel on the next press.'
    }
};
