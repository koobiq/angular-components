import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the select-loading-error-custom example. */
export interface ExampleText {
    tryAgain: string;
    failedToLoadLocations: string;
    customErrorState: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
