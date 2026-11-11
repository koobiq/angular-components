import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the datepicker examples. */
export interface ExampleText {
    packageRelease: string;
    disabledEmptyField: string;
    readOnlyField: string;
    minimaxHint: string;
    onlyNumbers: string;
    vacationPeriod: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        packageRelease: 'Дата и время выпуска пакета',
        disabledEmptyField: 'Отключённое пустое поле',
        readOnlyField: 'Поле только для чтения с данными',
        minimaxHint: 'Выберите дату между 14 декабря 2023 и 25 августа 2024.',
        onlyNumbers: 'Только цифры',
        vacationPeriod: 'Период отпуска:'
    },
    default: {
        packageRelease: 'Package release date and time',
        disabledEmptyField: 'Disabled empty field',
        readOnlyField: 'Read-only field with data',
        minimaxHint: 'Select a date between December 14, 2023, and August 25, 2024.',
        onlyNumbers: 'Only numbers',
        vacationPeriod: 'Vacation period:'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
