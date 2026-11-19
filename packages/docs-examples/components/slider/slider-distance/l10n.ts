import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    bounds: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        bounds: ['Минимальная задержка', 'Максимальная задержка']
    },
    'en-US': {
        bounds: ['Minimum delay', 'Maximum delay']
    }
};
