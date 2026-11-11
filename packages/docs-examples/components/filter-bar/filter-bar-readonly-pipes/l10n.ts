import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** One readonly pipe of the example: a name fixed by the object and its current value. */
export interface ExampleReadonlyPipe {
    name: string;
    value: string;
}

/** Text of the readonly-pipes example: it has no counterpart in the library's locale data. */
export interface ExampleText {
    search: string;
    user: string;
    readonlyPipes: ExampleReadonlyPipe[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
