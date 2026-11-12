import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the inline-edit-select-multiline example. */
export interface ExampleTranslation {
    resolutionComment: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        resolutionComment: 'Комментарий к решению'
    },
    default: {
        resolutionComment: 'Resolution comment'
    }
};
