import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the description list examples. Person names (John Smith, Jane Doe) stay as proper nouns. */
export interface ExampleText {
    incidentType: string;
    malwareInfection: string;
    identifier: string;
    status: string;
    new: string;
    assignee: string;
    description: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        incidentType: 'Тип инцидента',
        malwareInfection: 'Заражение вредоносным ПО',
        identifier: 'Идентификатор',
        status: 'Статус',
        new: 'Новый',
        assignee: 'Исполнитель',
        description: 'Описание'
    },
    default: {
        incidentType: 'Incident type',
        malwareInfection: 'Malware infection',
        identifier: 'Identifier',
        status: 'Status',
        new: 'New',
        assignee: 'Assignee',
        description: 'Description'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
