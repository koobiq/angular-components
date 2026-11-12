import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the inline-edit-select-multiline example. */
export interface ExampleText {
    resolutionComment: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        resolutionComment: 'Комментарий к решению'
    },
    default: {
        resolutionComment: 'Resolution comment'
    }
};
