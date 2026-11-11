import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the sidebar-with-splitter example. */
export interface ExampleText {
    openedContent: string;
    closedContent: string;
    mainContent: string;
    toggleModel: string;
    toggle: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        openedContent: 'Содержимое (открыто)',
        closedContent: 'Содержимое (закрыто)',
        mainContent: 'Основное содержимое',
        toggleModel: 'Переключить модель',
        toggle: 'Переключить'
    },
    default: {
        openedContent: 'Opened content',
        closedContent: 'Closed content',
        mainContent: 'Main content',
        toggleModel: 'Toggle model',
        toggle: 'Toggle'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
