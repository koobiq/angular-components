import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the tooltip-disabled-for-component example. */
export interface ExampleText {
    add: string;
    create: string;
    toggle: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
