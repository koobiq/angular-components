import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the code block examples. Code samples and file names stay as-is. */
export interface ExampleText {
    wordWrap: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        wordWrap: 'Перенос строк'
    },
    default: {
        wordWrap: 'Word wrap'
    }
};
