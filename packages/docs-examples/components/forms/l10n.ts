import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the forms examples. Layout labels (1/4 columns, Fixed 200) stay English as CSS mechanics. */
export interface ExampleText {
    fieldLabel: string;
    hintUnderField: string;
    commonLabel: string;
    exfiltration: string;
    lateralMovement: string;
    execution: string;
    surname: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        fieldLabel: 'Подпись поля',
        hintUnderField: 'Подсказка под полем',
        commonLabel: 'Общая подпись для нескольких полей',
        exfiltration: 'Эксфильтрация данных',
        lateralMovement: 'Перемещение внутри периметра',
        execution: 'Выполнение',
        surname: 'Фамилия'
    },
    default: {
        fieldLabel: 'Field label',
        hintUnderField: 'Hint under the field',
        commonLabel: 'Common label for several fields',
        exfiltration: 'Data exfiltration',
        lateralMovement: 'Lateral movement',
        execution: 'Execution',
        surname: 'Surname'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
