import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the actions-panel-with-dropdown-and-popover example. */
export interface ExampleText {
    open: string;
    protection: string;
    enable: string;
    disable: string;
    enableProtectionTitle: string;
    disableProtectionTitle: string;
    save: string;
    cancel: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        open: 'открыть',
        protection: 'Защита',
        enable: 'Включить',
        disable: 'Выключить',
        enableProtectionTitle: 'Включить защиту?',
        disableProtectionTitle: 'Выключить защиту?',
        save: 'Сохранить',
        cancel: 'Отмена'
    },
    default: {
        open: 'open',
        protection: 'Protection',
        enable: 'Enable',
        disable: 'Disable',
        enableProtectionTitle: 'Enable protection?',
        disableProtectionTitle: 'Disable protection?',
        save: 'Save',
        cancel: 'Cancel'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
