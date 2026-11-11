import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the popover-scroll example. */
export interface ExampleText {
    wonder: string;
    save: string;
    cancel: string;
    placeholder: string;
    noCloseOnScroll: string;
    closeOnScroll: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        wonder: 'Интересно, что это такое?',
        save: 'Сохранить',
        cancel: 'Отмена',
        placeholder: 'Интересная мысль',
        noCloseOnScroll: 'Поповер не закрывается при прокрутке',
        closeOnScroll: 'Закрывается при прокрутке'
    },
    default: {
        wonder: 'I wonder what this?',
        save: 'Save',
        cancel: 'Cancel',
        placeholder: 'Interesting thought',
        noCloseOnScroll: 'Popover does not close on scroll',
        closeOnScroll: 'Closes on scroll'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
