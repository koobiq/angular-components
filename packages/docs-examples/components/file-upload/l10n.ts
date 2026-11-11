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
    dragOnSidepanel: string;
    filesTxtAllowed: string;
    fileTxtAllowed: string;
    sizeNotExceed5mb: string;
    noMoreThan1mb: string;
    fileRequired: string;
    provideValidExtension: string;
    sizeLimitExceeded: string;
    failedToRead: string;
    onlyTxtWithLines: (maxLines: number) => string;
    sizeMustNotExceed: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        singleWithFormControl: 'Одиночная загрузка файлов с formControl',
        dropFilesHere: 'Перетащите файлы сюда',
        immediatelyLoad: 'Немедленная загрузка на бэкенд...',
        dragOnSidepanel: 'Перетащите файлы на боковую панель',
        filesTxtAllowed: 'Разрешены файлы с расширением TXT',
        fileTxtAllowed: 'Разрешён файл с расширением TXT',
        sizeNotExceed5mb: 'Размер файла не должен превышать 5 МБ',
        noMoreThan1mb: 'Не более 1 МБ',
        fileRequired: 'Файл обязателен',
        provideValidExtension: 'Укажите допустимое расширение',
        sizeLimitExceeded: 'Превышен лимит размера файла',
        failedToRead: 'Не удалось прочитать содержимое файла',
        onlyTxtWithLines: (maxLines) => `Разрешены только TXT-файлы до ${maxLines} строк`,
        sizeMustNotExceed: 'Размер файла не должен превышать лимит'
    },
    default: {
        singleWithFormControl: 'Single file-upload with formControl',
        dropFilesHere: 'Drop files here',
        immediatelyLoad: 'Immediately load to backend...',
        dragOnSidepanel: 'Drag your files on sidepanel',
        filesTxtAllowed: 'Files with TXT extension are allowed',
        fileTxtAllowed: 'File with TXT extension is allowed',
        sizeNotExceed5mb: 'The file size should not exceed 5 MB',
        noMoreThan1mb: 'No more than 1 MB',
        fileRequired: 'File required',
        provideValidExtension: 'Provide valid extension',
        sizeLimitExceeded: 'The file size limit has been exceeded',
        failedToRead: 'Failed to read file content',
        onlyTxtWithLines: (maxLines) => `Only TXT files with up to ${maxLines} lines are allowed`,
        sizeMustNotExceed: 'The file size must not exceed the limit'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
