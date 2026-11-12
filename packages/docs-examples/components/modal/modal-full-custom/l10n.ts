import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the modal-full-custom example. */
export interface ExampleText {
    save: string;
    close: string;
    openModal: string;
    fullyCustomModal: string;
    additionalContext: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
