import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the file-upload examples. The custom-text examples keep their hardcoded per-locale data — demonstrating that API is their point. */
export interface ExampleText {
    singleWithFormControl: string;
    dropFilesHere: string;
    immediatelyLoad: string;
    filesTxtAllowed: string;
    sizeNotExceed5mb: string;
    fileRequired: string;
    provideValidExtension: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        singleWithFormControl: 'Одиночная загрузка файлов с formControl',
        dropFilesHere: 'Перетащите файлы сюда',
        immediatelyLoad: 'Немедленная загрузка на бэкенд...',
        filesTxtAllowed: 'Разрешены файлы с расширением TXT',
        sizeNotExceed5mb: 'Размер файла не должен превышать 5 МБ',
        fileRequired: 'Файл обязателен',
        provideValidExtension: 'Укажите допустимое расширение'
    },
    default: {
        singleWithFormControl: 'Single file-upload with formControl',
        dropFilesHere: 'Drop files here',
        immediatelyLoad: 'Immediately load to backend...',
        filesTxtAllowed: 'Files with TXT extension are allowed',
        sizeNotExceed5mb: 'The file size should not exceed 5 MB',
        fileRequired: 'File required',
        provideValidExtension: 'Provide valid extension'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
