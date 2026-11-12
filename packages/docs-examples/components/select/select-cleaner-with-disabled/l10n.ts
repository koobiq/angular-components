import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the select-cleaner-with-disabled example. */
export interface ExampleText {
    kept: string;
    cleared: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        kept: 'Сохранено',
        cleared: 'Очищено'
    },
    default: {
        kept: 'Kept',
        cleared: 'Cleared'
    }
};
