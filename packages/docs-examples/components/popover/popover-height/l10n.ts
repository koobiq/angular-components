import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the popover-height example. */
export interface ExampleTranslation {
    save: string;
    cancel: string;
    withoutScroll: string;
    defaultHeight: string;
    customHeight: string;
    postBackHint: string;
    metadataHint: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        save: 'Сохранить',
        cancel: 'Отмена',
        withoutScroll: 'Без прокрутки',
        defaultHeight: 'С прокруткой, высота по умолчанию',
        customHeight: 'С прокруткой, произвольная высота',
        postBackHint: 'URL точки приёма SAML-ответов Management Center, включая схему (http:// или https://) и порт.',
        metadataHint: 'Метаданные Identity Provider в формате XML'
    },
    default: {
        save: 'Save',
        cancel: 'Cancel',
        withoutScroll: 'Without scrolling',
        defaultHeight: 'With scrolling, default height',
        customHeight: 'With scrolling, custom height',
        postBackHint:
            'URL of the Management Center SAML assertion consumer, including schema (http:// or https://) and port.',
        metadataHint: 'Your Identity Provider’s metadata in XML format'
    }
};
