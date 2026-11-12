import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the loader-overlay examples. */
export interface ExampleTranslation {
    creatingReport: string;
    reportProgress: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        creatingReport: 'Создание отчёта',
        reportProgress: '18,7 МБ из 25 МБ — осталось 2 мин'
    },
    default: {
        creatingReport: 'Creating report',
        reportProgress: '18.7 MB of 25 MB — 2 min left'
    }
};
