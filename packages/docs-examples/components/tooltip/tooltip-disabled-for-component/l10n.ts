import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tooltip-disabled-for-component example. */
export interface ExampleTranslation {
    add: string;
    create: string;
    toggle: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        add: 'Добавить',
        create: 'Создать',
        toggle: 'переключить'
    },
    default: {
        add: 'Add',
        create: 'Create',
        toggle: 'toggle'
    }
};
