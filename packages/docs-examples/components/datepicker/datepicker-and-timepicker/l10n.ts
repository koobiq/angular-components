import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the datepicker examples. */
export interface ExampleText {
    packageRelease: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        packageRelease: 'Дата и время выпуска пакета'
    },
    default: {
        packageRelease: 'Package release date and time'
    }
};
