import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the skeleton-group example. */
export interface ExampleText {
    loading: string;
    blocked: string;
    groupLinks: string[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        loading: 'Загрузка',
        blocked: 'Заблокирован',
        groupLinks: ['Обзор', 'API', 'Примеры', 'История изменений']
    },
    default: {
        loading: 'Loading',
        blocked: 'Blocked',
        groupLinks: ['Overview', 'API', 'Examples', 'Changelog']
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
