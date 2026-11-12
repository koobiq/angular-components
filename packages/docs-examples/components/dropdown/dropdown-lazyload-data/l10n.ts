import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the dropdown-lazyload-data example. */
export interface ExampleText {
    someInfo: string;
    value: string;
    dropdownTrigger: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
