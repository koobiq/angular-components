import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the toast-progress-bar-overview example. */
export interface ExampleText {
    cancel: string;
    importFiles: string;
    importProgress: string;
    toastWithProgress: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        cancel: 'Отмена',
        importFiles: 'Импорт файлов',
        importProgress: '12,1 МБ из 85 МБ — осталось 15 мин',
        toastWithProgress: 'Тост с прогресс-баром, кнопкой Отмена и без крестика'
    },
    default: {
        cancel: 'Cancel',
        importFiles: 'Importing files',
        importProgress: '12.1 MB of 85 MB — 15 min left',
        toastWithProgress: 'Toast with a progress bar, a Cancel button and no close icon'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
