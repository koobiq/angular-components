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
    name: string;
    patronymic: string;
    errorMessage: (field: string, ordinal: string) => string;
    first: string;
    second: string;
    third: string;
    fieldGroupTitle: string;
    ipAddress: string;
    longHint1: string;
    hint2: string;
    longLegend: string;
    save: string;
    longHintButton: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        fieldLabel: 'Подпись поля',
        hintUnderField: 'Подсказка под полем',
        commonLabel: 'Общая подпись для нескольких полей',
        exfiltration: 'Эксфильтрация данных',
        lateralMovement: 'Перемещение внутри периметра',
        execution: 'Выполнение',
        surname: 'Фамилия',
        name: 'Имя',
        patronymic: 'Отчество',
        errorMessage: (field, ordinal) => `${field}: сообщение об ошибке для ${ordinal} поля`,
        first: 'первого',
        second: 'второго',
        third: 'третьего',
        fieldGroupTitle: 'Название группы полей',
        ipAddress: 'IP-адрес',
        longHint1:
            'Подсказка для первого поля. Длинный текст подсказки под полем, который переносится на новую строку и занимает всю ширину группы',
        hint2: 'Подсказка для второго поля',
        longLegend: 'Длинное имя поля, которое переносится на новую строку и располагается даже над кнопкой.',
        save: 'Сохранить',
        longHintButton:
            'Длинный текст подсказки под полем, который переносится на новую строку и даже простирается под кнопкой.'
    },
    default: {
        fieldLabel: 'Field label',
        hintUnderField: 'Hint under the field',
        commonLabel: 'Common label for several fields',
        exfiltration: 'Data exfiltration',
        lateralMovement: 'Lateral movement',
        execution: 'Execution',
        surname: 'Surname',
        name: 'Name',
        patronymic: 'Patronymic',
        errorMessage: (field, ordinal) => `${field}: error message for the ${ordinal} field`,
        first: 'first',
        second: 'second',
        third: 'third',
        fieldGroupTitle: 'Field group title',
        ipAddress: 'IP-address',
        longHint1:
            'Hint for the first field. A long hint text below the field that wraps to a new line and spans the full width of the group',
        hint2: 'Hint for the second field',
        longLegend: 'A long field name that wraps to a new line and is positioned even above the button.',
        save: 'Save',
        longHintButton: 'A long hint text under the field that wraps to a new line and even extends beneath the button.'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
