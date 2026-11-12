import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the loader-overlay examples. */
export interface ExampleText {
    loading: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        loading: 'Загрузка'
    },
    default: {
        loading: 'Loading'
    }
};
