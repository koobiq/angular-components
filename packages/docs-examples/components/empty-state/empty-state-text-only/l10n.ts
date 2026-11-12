import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the empty-state-text-only example. */
export interface ExampleText {
    noInfo: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        noInfo: 'Нет информации'
    },
    default: {
        noInfo: 'No information'
    }
};
