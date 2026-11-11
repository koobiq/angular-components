import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the tooltip-disabled-for-component example. */
export interface ExampleText {
    toggle: string;
    add: string;
    create: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        toggle: 'переключить',
        add: 'Добавить',
        create: 'Создать'
    },
    default: {
        toggle: 'toggle',
        add: 'Add',
        create: 'Create'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
