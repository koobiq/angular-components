import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the dropdown-with-filter example. */
export interface ExampleText {
    search: string;
    subheaderForActions: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        search: 'Поиск',
        subheaderForActions: 'Подзаголовок для действий'
    },
    default: {
        search: 'Search',
        subheaderForActions: 'Subheader for actions'
    }
};
