import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the readonly-pipes example: it has no counterpart in the library's locale data. */
export interface ExampleTranslation {
    /** The text search pipe: the first pipe in every filter, always present, never removable. */
    search: string;
    user: string;
    readonlyPipes: ExampleReadonlyPipe[];
}

/** One readonly pipe of the example: a name fixed by the object and its current value. */
export interface ExampleReadonlyPipe {
    name: string;
    value: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        search: 'Поиск',
        user: 'Пользователь',
        readonlyPipes: [
            { name: 'Домен', value: 'Управление системой' },
            { name: 'Тип объекта', value: 'PaxMatrol IEMS' },
            { name: 'Действие', value: 'Изменение' },
            { name: 'Объект', value: 'Resolver' }
        ]
    },
    default: {
        search: 'Search',
        user: 'User',
        readonlyPipes: [
            { name: 'Domain', value: 'System management' },
            { name: 'Object type', value: 'PaxMatrol IEMS' },
            { name: 'Action', value: 'Modification' },
            { name: 'Object', value: 'Resolver' }
        ]
    }
};
