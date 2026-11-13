import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the modal-scroll example. */
export interface ExampleTranslation {
    openModal: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        openModal: 'Открыть модалку'
    },
    default: {
        openModal: 'Open Modal'
    }
};
