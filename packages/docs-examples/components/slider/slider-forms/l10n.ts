import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    retention: string;
    window: string;
    hint: string;
    error: string;
    save: string;
    saved: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        retention: 'Хранение событий, дней',
        window: 'Период анализа, дней',
        hint: 'Анализ охватывает события за выбранное число последних дней.',
        error: 'Период анализа превышает срок хранения событий.',
        save: 'Сохранить',
        saved: 'Сохранено (хранение / анализ):'
    },
    'en-US': {
        retention: 'Event retention, days',
        window: 'Analysis window, days',
        hint: 'The analysis includes events from the selected number of recent days.',
        error: 'The analysis window exceeds event retention.',
        save: 'Save',
        saved: 'Saved (retention / analysis):'
    }
};
