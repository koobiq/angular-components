import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the time-range examples. */
export interface ExampleText {
    placeholder: string;
    withPresets: string;
    withoutPresets: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
