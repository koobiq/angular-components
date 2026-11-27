import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    channel: string;
    bounds: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        channel: 'Канал',
        bounds: ['Нижняя граница', 'Верхняя граница']
    },
    'en-US': {
        channel: 'Channel',
        bounds: ['Lower bound', 'Upper bound']
    }
};
