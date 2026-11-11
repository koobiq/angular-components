import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the sidebar-overview example. */
export interface ExampleText {
    leftOpenedContent: string;
    leftClosedContent: string;
    rightOpenedContent: string;
    rightClosedContent: string;
    mainContent: string;
    toggleLeftModel: string;
    toggleLeft: string;
    toggleRightModel: string;
    toggleRight: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        leftOpenedContent: 'Содержимое левой панели (открыта)',
        leftClosedContent: 'Содержимое левой панели (закрыта)',
        rightOpenedContent: 'Содержимое правой панели (открыта)',
        rightClosedContent: 'Содержимое правой панели (закрыта)',
        mainContent: 'Основное содержимое',
        toggleLeftModel: 'Переключить левую модель',
        toggleLeft: 'Переключить левую',
        toggleRightModel: 'Переключить правую модель',
        toggleRight: 'Переключить правую'
    },
    default: {
        leftOpenedContent: 'Left opened content',
        leftClosedContent: 'Left closed content',
        rightOpenedContent: 'Right opened content',
        rightClosedContent: 'Right closed content',
        mainContent: 'Main content',
        toggleLeftModel: 'Toggle left model',
        toggleLeft: 'Toggle left',
        toggleRightModel: 'Toggle right model',
        toggleRight: 'Toggle right'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
