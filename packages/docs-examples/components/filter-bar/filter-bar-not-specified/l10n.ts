import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the not-specified example; the option is worded to agree with the name of the filter. */
export interface ExampleTranslation {
    name: string;
    notSpecified: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        name: 'Тип атаки',
        notSpecified: 'Не указан'
    },
    default: {
        name: 'Attack Type',
        notSpecified: 'Not specified'
    }
};
