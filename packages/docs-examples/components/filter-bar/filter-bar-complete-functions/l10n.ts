import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the complete-functions example: it has no counterpart in the library's locale data. */
export interface ExampleTranslation {
    /** The text search pipe: the first pipe in every filter, always present, never removable. */
    search: string;
    undefinedOption: string;
    legitimateAction: string;
    changeAlert: string;
    resetAlert: string;
    deleteAlert: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
