import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the dropdown-lazyload-data example. */
export interface ExampleTranslation {
    someInfo: string;
    value: string;
    dropdownTrigger: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        someInfo: 'Информация',
        value: 'Значение:',
        dropdownTrigger: 'выпадающий список'
    },
    default: {
        someInfo: 'Some info',
        value: 'Value:',
        dropdownTrigger: 'dropdown'
    }
};
