import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the file-upload-single-accept-validation example. */
export interface ExampleTranslation {
    provideValidExtension: string;
    fileTxtAllowed: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        provideValidExtension: 'Укажите допустимое расширение',
        fileTxtAllowed: 'Разрешён файл с расширением TXT'
    },
    default: {
        provideValidExtension: 'Provide valid extension',
        fileTxtAllowed: 'File with TXT extension is allowed'
    }
};
