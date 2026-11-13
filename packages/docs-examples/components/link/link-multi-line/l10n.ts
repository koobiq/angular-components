import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the link examples. Size toggles (Compact, Normal, Big) stay English as API values. */
export interface ExampleTranslation {
    agree: string;
    licenseTerms: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        agree: 'Я полностью согласен',
        licenseTerms: 'с условиями лицензионного соглашения'
    },
    default: {
        agree: 'I fully agree',
        licenseTerms: 'with the terms of the license agreement'
    }
};
