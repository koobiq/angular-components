import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the checkbox examples. */
export interface ExampleTranslation {
    title: string;
    loremIpsum: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        title: 'Заголовок',
        loremIpsum: 'Lorem ipsum'
    },
    default: {
        title: 'Title',
        loremIpsum: 'Lorem ipsum'
    }
};
