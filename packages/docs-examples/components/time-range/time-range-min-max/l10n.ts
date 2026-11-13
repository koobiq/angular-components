import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the time-range examples. */
export interface ExampleTranslation {
    placeholder: string;
    withPresets: string;
    withoutPresets: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        placeholder: 'Период',
        withPresets: 'С предустановками',
        withoutPresets: 'Без предустановок'
    },
    default: {
        placeholder: 'Period',
        withPresets: 'With presets',
        withoutPresets: 'Without presets'
    }
};
