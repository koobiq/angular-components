import { LocalizedText } from '@koobiq/docs-examples/i18n';

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

export const TEXT: LocalizedText<ExampleText> = {
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
