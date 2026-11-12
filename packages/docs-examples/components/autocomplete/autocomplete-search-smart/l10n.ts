import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the autocomplete examples. */
export interface ExampleTranslation {
    try: string;
    or: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        try: 'Попробуйте',
        or: 'или'
    },
    default: {
        try: 'Try',
        or: 'or'
    }
};
