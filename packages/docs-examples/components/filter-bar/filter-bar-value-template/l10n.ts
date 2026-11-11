import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Status labels of the value-template example: it has no counterpart in the library's locale data. */
export interface ExampleText {
    installed: string;
    error: string;
    incompatible: string;
    unknown: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        installed: 'Установлен',
        error: 'Ошибка',
        incompatible: 'Операционная система активного узла несовместима с текущей версией агента',
        unknown: 'Ошибки неопределенного характера'
    },
    default: {
        installed: 'Installed',
        error: 'Error',
        incompatible: 'The active node operating system is incompatible with the current agent version',
        unknown: 'Unspecified errors'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
