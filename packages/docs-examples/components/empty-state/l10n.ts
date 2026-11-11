import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the empty-state examples. Size toggle labels (Compact, Normal, Big) stay English as API values. */
export interface ExampleText {
    createGroup: string;
    mergeGroups: string;
    agentsGroupText: string;
    noGroups: string;
    errorTitle: string;
    errorText: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        createGroup: 'Создать группу',
        mergeGroups: 'Объединить группы',
        agentsGroupText: 'Агенты можно объединить в группу и назначить им одни и те же политики',
        noGroups: 'Нет групп',
        errorTitle: 'Не удалось показать записи',
        errorText: 'Проблема с сетью или подключением к БД. Попробуйте еще раз или обратитесь к администратору.'
    },
    default: {
        createGroup: 'Create group',
        mergeGroups: 'Merge groups',
        agentsGroupText: 'Agents can be grouped together and assigned the same policies.',
        noGroups: 'No Groups',
        errorTitle: 'Failed to load records',
        errorText:
            'There is a problem with the network or the database connection. Please try again or contact your administrator.'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
