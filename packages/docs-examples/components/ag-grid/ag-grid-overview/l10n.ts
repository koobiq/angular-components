import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the ag-grid-overview example. */
export interface ExampleTranslation {
    headerText: string;
    link: string;
    linkN: (index: number) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headerText: 'Текст',
        link: 'Ссылка',
        linkN: (index) => `Ссылка ${index}`
    },
    default: {
        headerText: 'Text',
        link: 'Link',
        linkN: (index) => `Link ${index}`
    }
};
