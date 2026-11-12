import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the dropdown-with-filter example. */
export interface ExampleTranslation {
    search: string;
    subheaderForActions: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        search: 'Поиск',
        subheaderForActions: 'Подзаголовок для действий'
    },
    default: {
        search: 'Search',
        subheaderForActions: 'Subheader for actions'
    }
};
