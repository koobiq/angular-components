import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the file-upload-single-accept-validation example. */
export interface ExampleText {
    provideValidExtension: string;
    fileTxtAllowed: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        provideValidExtension: 'Укажите допустимое расширение',
        fileTxtAllowed: 'Разрешён файл с расширением TXT'
    },
    default: {
        provideValidExtension: 'Provide valid extension',
        fileTxtAllowed: 'File with TXT extension is allowed'
    }
};
