import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the popover-arrow-and-offset example. */
export interface ExampleText {
    wonder: string;
    save: string;
    cancel: string;
    arrow: string;
    arrowCentered: string;
    offset: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        wonder: 'Интересно, что это такое?',
        save: 'Сохранить',
        cancel: 'Отмена',
        arrow: 'Стрелка',
        arrowCentered: 'Стрелка по центру',
        offset: 'Смещение'
    },
    default: {
        wonder: 'I wonder what this?',
        save: 'Save',
        cancel: 'Cancel',
        arrow: 'Arrow',
        arrowCentered: 'Arrow centered',
        offset: 'Offset'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
