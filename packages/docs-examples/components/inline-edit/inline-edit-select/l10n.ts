import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the inline-edit-select example. */
export interface ExampleTranslation {
    assignee: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        assignee: 'Исполнитель'
    },
    default: {
        assignee: 'Assignee'
    }
};
