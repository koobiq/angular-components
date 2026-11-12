import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the radio examples. Person names stay as proper nouns; Normal/Big/Error are style names. */
export interface ExampleText {
    fieldLabel: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        fieldLabel: 'Подпись поля'
    },
    default: {
        fieldLabel: 'Field label'
    }
};
