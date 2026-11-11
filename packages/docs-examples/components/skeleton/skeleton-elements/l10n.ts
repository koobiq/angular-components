import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the skeleton-elements example. */
export interface ExampleText {
    loading: string;
    start: string;
    active: string;
    history: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        loading: 'Загрузка',
        start: 'Запустить',
        active: 'Активен',
        history: 'История'
    },
    default: {
        loading: 'Loading',
        start: 'Start',
        active: 'Active',
        history: 'History'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
