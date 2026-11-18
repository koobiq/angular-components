import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the code block examples. Code samples and file names stay as-is. */
export interface ExampleTranslation {
    lineNumbers: string;
    filled: string;
    hideTabs: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        lineNumbers: 'Нумерация строк',
        filled: 'Заливка',
        hideTabs: 'Скрыть вкладки'
    },
    default: {
        lineNumbers: 'Line numbers',
        filled: 'Filled',
        hideTabs: 'Hide tabs'
    }
};
