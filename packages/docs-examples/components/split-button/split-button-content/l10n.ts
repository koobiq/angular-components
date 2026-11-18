import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the split-button examples. Style names (Filled Contrast) stay English as API names. */
export interface ExampleTranslation {
    splitButton: string;
    moreOptions: string;
    add: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        splitButton: 'Кнопка с меню',
        moreOptions: 'Другие параметры',
        add: 'Добавить'
    },
    default: {
        splitButton: 'Split Button',
        moreOptions: 'More options',
        add: 'Add'
    }
};
