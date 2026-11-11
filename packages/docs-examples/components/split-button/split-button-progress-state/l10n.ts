import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the split-button-progress-state example. */
export interface ExampleText {
    splitButton: string;
    moreOptions: string;
    primaryProgress: string;
    secondaryProgress: string;
    completelyProgress: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        splitButton: 'Кнопка с меню',
        moreOptions: 'Другие параметры',
        primaryProgress: 'Основная в процессе',
        secondaryProgress: 'Вторичная в процессе',
        completelyProgress: 'Полностью в процессе'
    },
    default: {
        splitButton: 'Split Button',
        moreOptions: 'More options',
        primaryProgress: 'Primary in Progress',
        secondaryProgress: 'Secondary in Progress',
        completelyProgress: 'Completely in Progress'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
