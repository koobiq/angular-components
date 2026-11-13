import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the overflow-items examples. */
export interface ExampleTranslation {
    andMore: (count: number) => string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        andMore: (count) => `и ещё ${count}`
    },
    default: {
        andMore: (count) => `and ${count} more`
    }
};
