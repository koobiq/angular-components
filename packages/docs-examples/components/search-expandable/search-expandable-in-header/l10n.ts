import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the search-expandable examples. */
export interface ExampleText {
    panelTitle: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        panelTitle: 'Название панели'
    },
    default: {
        panelTitle: 'Panel Title'
    }
};
