import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the select-loading-error-custom example. */
export interface ExampleText {
    tryAgain: string;
    failedToLoadLocations: string;
    customErrorState: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        tryAgain: 'Повторить',
        failedToLoadLocations: 'Не удалось загрузить список локаций',
        customErrorState: 'Пользовательское состояние ошибки'
    },
    default: {
        tryAgain: 'Try Again',
        failedToLoadLocations: 'Failed to load the location list',
        customErrorState: 'Custom Error State'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
