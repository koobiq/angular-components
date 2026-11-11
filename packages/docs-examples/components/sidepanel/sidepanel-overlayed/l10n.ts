import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the sidepanel-overlayed example. */
export interface ExampleText {
    close: string;
    openAnother: string;
    position: string;
    templateContent: string;
    templateBody: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        close: 'Закрыть',
        openAnother: 'Открыть другую панель',
        position: 'Позиция',
        templateContent: 'Содержимое шаблона панели',
        templateBody: 'Тело шаблона панели'
    },
    default: {
        close: 'Close',
        openAnother: 'Open another sidepanel',
        position: 'Position',
        templateContent: 'Sidepanel Template Content',
        templateBody: 'Sidepanel Template Body'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
