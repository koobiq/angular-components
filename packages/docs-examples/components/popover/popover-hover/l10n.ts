import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the popover-hover example. */
export interface ExampleText {
    wonder: string;
    save: string;
    cancel: string;
    placeholder: string;
    open: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        wonder: 'Интересно, что это такое?',
        save: 'Сохранить',
        cancel: 'Отмена',
        placeholder: 'Интересная мысль',
        open: 'Открыть поповер'
    },
    default: {
        wonder: 'I wonder what this?',
        save: 'Save',
        cancel: 'Cancel',
        placeholder: 'Interesting thought',
        open: 'Open popover'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
