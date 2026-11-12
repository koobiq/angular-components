import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the accordion examples. Feature-toggle labels (Icon, Caption, Badge) stay English as demo metadata. */
export interface ExampleText {
    sectionTitle: string;
    content: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        sectionTitle: 'Текст',
        content: 'Данный текст используется для иллюстрации внутреннего содержимого секции аккордеона'
    },
    default: {
        sectionTitle: 'Text',
        content: 'This text illustrates the inner content of the accordion section'
    }
};
