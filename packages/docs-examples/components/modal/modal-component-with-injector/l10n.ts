import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the modal-component-with-injector example. */
export interface ExampleText {
    close: string;
    openModal: string;
    title: string;
    subtitle: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
