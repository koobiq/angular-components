import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the select-footer example. */
export interface ExampleTranslation {
    button: string;
    caption: string;
    link: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        button: 'Кнопка',
        caption: 'Подпись',
        link: 'Ссылка'
    },
    default: {
        button: 'Button',
        caption: 'Caption',
        link: 'Link'
    }
};
