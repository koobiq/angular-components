import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the complete-functions example: it has no counterpart in the library's locale data. */
export interface ExampleText {
    search: string;
    undefinedOption: string;
    legitimateAction: string;
    changeAlert: string;
    resetAlert: string;
    deleteAlert: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        search: 'Поиск',
        undefinedOption: 'Не определен',
        legitimateAction: 'Легитимное действие',
        changeAlert: 'Нужно что то изменить в фильтре',
        resetAlert: 'Нужно сбросить изменения в фильтре',
        deleteAlert: 'Нужно удалить фильтр'
    },
    default: {
        search: 'Search',
        undefinedOption: 'Undefined',
        legitimateAction: 'Legitimate action',
        changeAlert: 'Something has to change in the filter',
        resetAlert: 'The filter changes have to be reset',
        deleteAlert: 'The filter has to be deleted'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
