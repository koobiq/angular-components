import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the top-bar examples. */
export interface ExampleText {
    actions: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        actions: 'Действия'
    },
    default: {
        actions: 'Actions'
    }
};
