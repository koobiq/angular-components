import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the modal-full-custom example. */
export interface ExampleText {
    save: string;
    close: string;
    openModal: string;
    fullyCustomModal: string;
    additionalContext: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        save: 'Сохранить',
        close: 'Закрыть',
        openModal: 'Открыть модалку',
        fullyCustomModal: 'Полностью кастомная модалка',
        additionalContext: 'Дополнительный контекст или описание диалога'
    },
    default: {
        save: 'Save',
        close: 'Close',
        openModal: 'Open Modal',
        fullyCustomModal: 'Fully custom modal',
        additionalContext: 'Additional context or description for the dialog'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
