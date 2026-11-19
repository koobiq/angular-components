import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    contain: string;
    center: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        contain: 'Бегунок внутри границ шкалы',
        center: 'Центр бегунка на конце шкалы'
    },
    'en-US': {
        contain: 'Thumb contained within the track',
        center: 'Thumb centered on the endpoint'
    }
};
