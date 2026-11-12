import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the load-text example. */
export interface ExampleText {
    headerText: string;
    loading: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        headerText: 'Текст',
        loading: 'Загрузка...'
    },
    default: {
        headerText: 'Text',
        loading: 'Loading...'
    }
};
