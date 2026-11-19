import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    value: string;
    interval: string;
    times: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        value: 'Яркость экрана',
        interval: 'Автоблокировка',
        times: ['Никогда', '1 мин', '15 мин', '30 мин', '1 ч', '3 ч']
    },
    'en-US': {
        value: 'Screen brightness',
        interval: 'Auto-lock',
        times: ['Never', '1 min', '15 min', '30 min', '1 hr', '3 hrs']
    }
};
