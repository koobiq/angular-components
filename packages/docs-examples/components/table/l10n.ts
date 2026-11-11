import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the table examples. Dates and file names stay as-is. */
export interface ExampleText {
    file: string;
    owner: string;
    modified: string;
    size: string;
    events: string[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        file: 'Файл',
        owner: 'Владелец',
        modified: 'Изменён',
        size: 'Размер',
        events: [
            'Кража учётных данных',
            'DDoS',
            'HIPS-алерт',
            'Спам-атака',
            'Эксплуатация уязвимости',
            'Сложная атака'
        ]
    },
    default: {
        file: 'File',
        owner: 'Owner',
        modified: 'Modified',
        size: 'Size',
        events: ['Identity Theft', 'DDoS', 'HIPS Alert', 'Spam Attack', 'Vulnerability Exploitation', 'Complex Attack']
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
