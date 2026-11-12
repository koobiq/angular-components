import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the loader-overlay examples. */
export interface ExampleText {
    loadingData: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        loadingData: 'Загрузка данных'
    },
    default: {
        loadingData: 'Loading data'
    }
};
