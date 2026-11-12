import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the horizontal-form-labels example. */
export interface ExampleTranslation {
    customFraction: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        customFraction: 'Произвольная (напр., 1/3 от ширины)'
    },
    default: {
        customFraction: 'Custom (e.g. 1/3 cols)'
    }
};
