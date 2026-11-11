import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the sidepanel-state-saving example. */
export interface ExampleText {
    stateSaving: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        stateSaving: 'Сохранение состояния панели'
    },
    default: {
        stateSaving: 'Sidepanel state saving'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
