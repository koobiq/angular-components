import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the validation-message-for-specific-field example. */
export interface ExampleTranslation {
    required: string;
    submit: string;
    errorAboveHint: string;
    errorReplacesHint: string;
    hintUnderField: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        required: 'Обязательно',
        submit: 'Отправить',
        errorAboveHint: 'Сообщение об ошибке отображается над подсказкой',
        errorReplacesHint: 'Сообщение об ошибке заменяет подсказку',
        hintUnderField: 'Подсказка под полем'
    },
    default: {
        required: 'Required',
        submit: 'Submit',
        errorAboveHint: 'The error message appears above the hint',
        errorReplacesHint: 'The error message replaces the hint',
        hintUnderField: 'Hint under the field'
    }
};
