import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the datepicker examples. */
export interface ExampleTranslation {
    packageRelease: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        packageRelease: 'Дата и время выпуска пакета'
    },
    default: {
        packageRelease: 'Package release date and time'
    }
};
