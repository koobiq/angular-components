import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the list-action-button example. */
export interface ExampleTranslation {
    selected: string;
    elements: string;
    longElementName: string;
    badge: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        selected: 'Выбрано:',
        elements: 'Элементы',
        longElementName: 'Элемент с очень очень очень очень очень очень длинным именем',
        badge: 'бейдж'
    },
    default: {
        selected: 'Selected:',
        elements: 'Elements',
        longElementName: 'Element with a very very very very very very long name',
        badge: 'badge'
    }
};
