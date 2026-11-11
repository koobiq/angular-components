import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the vertical-form example. */
export interface ExampleText {
    fieldLabel: string;
    hintUnderField: string;
    commonLabel: string;
    exfiltration: string;
    lateralMovement: string;
    execution: string;
    longLabel: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
