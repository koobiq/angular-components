import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the toast-multiline example. */
export interface ExampleText {
    refresh: string;
    showToast: string;
    multilineTitle: string;
    multilineCaption: string;
    multilineContent: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        refresh: 'Обновить',
        showToast: 'Показать тост',
        multilineTitle: 'Доступно \nобновление \nагента',
        multilineCaption: 'Версия: \n2.03.15 от 15 мая 2022',
        multilineContent:
            'Содержит: \n№1 - Очень важные изменения\n№2 - Менее важные изменения\n№3 - Совсем неважные изменения'
    },
    default: {
        refresh: 'Refresh',
        showToast: 'Show toast',
        multilineTitle: 'Agent \nupdate \navailable',
        multilineCaption: 'Version: \n2.03.15 from May 15, 2022',
        multilineContent:
            'Includes: \n#1 - Very important changes\n#2 - Less important changes\n#3 - Not important changes at all'
    }
};
