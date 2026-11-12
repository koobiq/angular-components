import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the horizontal-form example. */
export interface ExampleTranslation {
    fieldLabel: string;
    hintUnderField: string;
    commonLabel: string;
    exfiltration: string;
    lateralMovement: string;
    execution: string;
    longLabel: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        fieldLabel: 'Подпись поля',
        hintUnderField: 'Подсказка под полем',
        commonLabel: 'Общая подпись для нескольких полей',
        exfiltration: 'Эксфильтрация данных',
        lateralMovement: 'Перемещение внутри периметра',
        execution: 'Выполнение',
        longLabel: 'Длинное название поля в несколько строк с возможным переносом на новую строку'
    },
    default: {
        fieldLabel: 'Field label',
        hintUnderField: 'Hint under the field',
        commonLabel: 'Common label for several fields',
        exfiltration: 'Data exfiltration',
        lateralMovement: 'Lateral movement',
        execution: 'Execution',
        longLabel: 'A long field name that spans several lines and may wrap to a new line'
    }
};
