import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the dynamic translation examples. */
export interface ExampleTranslation {
    registered: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        registered: 'Зарегистрировано инцидентов: [[bold:1000]].'
    },
    default: {
        registered: '[[bold:1000]] incidents have been registered.'
    }
};
