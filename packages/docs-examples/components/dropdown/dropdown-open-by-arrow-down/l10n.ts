import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the dropdown-open-by-arrow-down example. */
export interface ExampleText {
    textNormal: string;
    caption: string;
    header: string;
    disabled: string;
    point2: string;
    toggleOpenByArrowDown: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        textNormal: 'Обычный текст',
        caption: 'Подпись',
        header: 'Заголовок',
        disabled: 'Отключено',
        point2: 'Пункт 2',
        toggleOpenByArrowDown: 'переключить openByArrowDown'
    },
    default: {
        textNormal: 'Text Normal',
        caption: 'Caption',
        header: 'Header',
        disabled: 'Disabled',
        point2: 'Point 2',
        toggleOpenByArrowDown: 'toggle openByArrowDown'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
