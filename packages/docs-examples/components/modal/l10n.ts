import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the modal examples. */
export interface ExampleText {
    saveChangesAria: string;
    saveChangesContent: string;
    save: string;
    cancel: string;
    changesSaved: string;
    close: string;
    openModal: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        saveChangesAria: 'Сохранить изменения',
        saveChangesContent: 'Сохранить изменения?',
        save: 'Сохранить',
        cancel: 'Отмена',
        changesSaved: 'Изменения сохранены',
        close: 'Закрыть',
        openModal: 'Открыть модалку'
    },
    default: {
        saveChangesAria: 'Save changes',
        saveChangesContent: 'Save changes?',
        save: 'Save',
        cancel: 'Cancel',
        changesSaved: 'Changes saved',
        close: 'Close',
        openModal: 'Open Modal'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
