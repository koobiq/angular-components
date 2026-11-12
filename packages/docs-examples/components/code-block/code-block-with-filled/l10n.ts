import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the code block examples. Code samples and file names stay as-is. */
export interface ExampleText {
    filled: string;
    alwaysShowActionbar: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        filled: 'Заливка',
        alwaysShowActionbar: 'Всегда показывать панель действий'
    },
    default: {
        filled: 'Filled',
        alwaysShowActionbar: 'Always show actionbar'
    }
};
