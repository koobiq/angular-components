import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the modal-component-with-injector example. */
export interface ExampleTranslation {
    close: string;
    openModal: string;
    title: string;
    subtitle: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        close: 'Закрыть',
        openModal: 'Открыть модалку',
        title: 'заголовок',
        subtitle: 'подзаголовок'
    },
    default: {
        close: 'Close',
        openModal: 'Open Modal',
        title: 'title',
        subtitle: 'subtitle'
    }
};
