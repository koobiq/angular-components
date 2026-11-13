import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the code block examples. Code samples and file names stay as-is. */
export interface ExampleTranslation {
    wordWrap: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        wordWrap: 'Перенос строк'
    },
    default: {
        wordWrap: 'Word wrap'
    }
};
