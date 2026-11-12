import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the alert examples. */
export interface ExampleText {
    close: string;
    showAlert: string;
    saveFailed: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        close: 'Закрыть',
        showAlert: 'Показать алерт',
        saveFailed: 'Не удалось сохранить изменения. Попробуйте ещё раз.'
    },
    default: {
        close: 'Close',
        showAlert: 'Show alert',
        saveFailed: 'Failed to save changes. Please try again.'
    }
};
