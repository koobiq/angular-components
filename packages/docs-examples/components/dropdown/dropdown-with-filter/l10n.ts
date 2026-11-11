import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the dropdown-with-filter example. */
export interface ExampleText {
    search: string;
    subheaderForActions: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        search: 'Поиск',
        subheaderForActions: 'Подзаголовок для действий'
    },
    default: {
        search: 'Search',
        subheaderForActions: 'Subheader for actions'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
