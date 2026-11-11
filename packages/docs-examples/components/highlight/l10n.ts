import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the highlight examples. Search demo data (Cube articles, clubs) stays English so the queries match. */
export interface ExampleText {
    search: string;
    chooseClub: string;
    nothingFound: string;
    city: string;
    company: string;
    person: string;
    notes: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        search: 'Поиск',
        chooseClub: 'Выберите клуб',
        nothingFound: 'Ничего не найдено',
        city: 'Город',
        company: 'Компания',
        person: 'Контакт',
        notes: 'Заметки'
    },
    default: {
        search: 'Search',
        chooseClub: 'Choose a club',
        nothingFound: 'Nothing found',
        city: 'City',
        company: 'Company',
        person: 'Person',
        notes: 'Notes'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
