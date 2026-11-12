import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the modal-scroll example. */
export interface ExampleText {
    openModal: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        openModal: 'Открыть модалку'
    },
    default: {
        openModal: 'Open Modal'
    }
};
