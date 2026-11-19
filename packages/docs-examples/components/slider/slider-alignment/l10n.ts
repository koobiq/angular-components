import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    value: string;
    contain: string;
    center: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        value: 'Значение',
        contain: 'Бегунок внутри границ шкалы',
        center: 'Центр бегунка на конце шкалы'
    },
    'en-US': {
        value: 'Value',
        contain: 'Thumb contained within the track',
        center: 'Thumb centered on the endpoint'
    }
};
