import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Status labels of the value-template example: it has no counterpart in the library's locale data. */
export interface ExampleText {
    /** The text search pipe: the first pipe in every filter, always present, never removable. */
    search: string;
    installed: string;
    error: string;
    incompatible: string;
    unknown: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        search: 'Поиск',
        installed: 'Установлен',
        error: 'Ошибка',
        incompatible: 'Операционная система активного узла несовместима с текущей версией агента',
        unknown: 'Ошибки неопределенного характера'
    },
    default: {
        search: 'Search',
        installed: 'Installed',
        error: 'Error',
        incompatible: 'The active node operating system is incompatible with the current agent version',
        unknown: 'Unspecified errors'
    }
};
