import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the validation examples. */
export interface ExampleText {
    name: string;
    lastName: string;
    patronymic: string;
    comment: string;
    required: string;
    optional: string;
    submit: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        name: 'Имя',
        lastName: 'Фамилия',
        patronymic: 'Отчество',
        comment: 'Комментарий',
        required: 'Обязательно',
        optional: 'Необязательно',
        submit: 'Отправить'
    },
    default: {
        name: 'Name',
        lastName: 'Last name',
        patronymic: 'Patronymic',
        comment: 'Comment',
        required: 'Required',
        optional: 'Optional',
        submit: 'Submit'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
