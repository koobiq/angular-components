import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    label: string;
    bounds: string[];
    hint: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        label: 'Диапазон задержки, мин',
        bounds: ['Минимальная задержка', 'Максимальная задержка'],
        hint: 'Между границами всегда остаётся не меньше 10 минут.'
    },
    'en-US': {
        label: 'Delay range, min',
        bounds: ['Minimum delay', 'Maximum delay'],
        hint: 'The bounds stay at least 10 minutes apart.'
    }
};
