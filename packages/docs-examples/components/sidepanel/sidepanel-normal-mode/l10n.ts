import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the sidepanel-normal-mode example. */
export interface ExampleText {
    position: string;
    closeSidepanel: string;
    openSidepanel: string;
    templateContent: string;
    templateBody: string;
    button: string;
    action: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        position: 'Позиция',
        closeSidepanel: 'Закрыть панель',
        openSidepanel: 'Открыть панель',
        templateContent: 'Содержимое шаблона панели',
        templateBody: 'Тело шаблона панели',
        button: 'Кнопка',
        action: 'Действие'
    },
    default: {
        position: 'Position',
        closeSidepanel: 'Close sidepanel',
        openSidepanel: 'Open sidepanel',
        templateContent: 'Sidepanel Template Content',
        templateBody: 'Sidepanel Template Body',
        button: 'Button',
        action: 'Action'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
