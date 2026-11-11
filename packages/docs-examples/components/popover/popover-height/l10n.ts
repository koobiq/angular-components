import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the popover-height example. */
export interface ExampleText {
    withoutScroll: string;
    defaultHeight: string;
    customHeight: string;
    save: string;
    cancel: string;
    postBackHint: string;
    metadataHint: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        withoutScroll: 'Без прокрутки',
        defaultHeight: 'С прокруткой, высота по умолчанию',
        customHeight: 'С прокруткой, произвольная высота',
        save: 'Сохранить',
        cancel: 'Отмена',
        postBackHint: 'URL точки приёма SAML-ответов Management Center, включая схему (http:// или https://) и порт.',
        metadataHint: 'Метаданные Identity Provider в формате XML'
    },
    default: {
        withoutScroll: 'Without scrolling',
        defaultHeight: 'With scrolling, default height',
        customHeight: 'With scrolling, custom height',
        save: 'Save',
        cancel: 'Cancel',
        postBackHint:
            'URL of the Management Center SAML assertion consumer, including schema (http:// or https://) and port.',
        metadataHint: 'Your Identity Provider’s metadata in XML format'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
