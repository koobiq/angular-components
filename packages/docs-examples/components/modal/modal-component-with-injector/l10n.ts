import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the modal-component-with-injector example. */
export interface ExampleText {
    close: string;
    openModal: string;
    title: string;
    subtitle: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
