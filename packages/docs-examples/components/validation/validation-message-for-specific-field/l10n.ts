import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the validation-message-for-specific-field example. */
export interface ExampleText {
    errorAboveHint: string;
    errorReplacesHint: string;
    required: string;
    hintUnderField: string;
    submit: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        errorAboveHint: 'Сообщение об ошибке отображается над подсказкой',
        errorReplacesHint: 'Сообщение об ошибке заменяет подсказку',
        required: 'Обязательно',
        hintUnderField: 'Подсказка под полем',
        submit: 'Отправить'
    },
    default: {
        errorAboveHint: 'The error message appears above the hint',
        errorReplacesHint: 'The error message replaces the hint',
        required: 'Required',
        hintUnderField: 'Hint under the field',
        submit: 'Submit'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
