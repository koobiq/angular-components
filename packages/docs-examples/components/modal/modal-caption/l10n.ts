import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the modal-caption example. */
export interface ExampleTranslation {
    cancel: string;
    stringCaption: string;
    templateCaption: string;
    templateWord: string;
    dialogTitle: string;
    longDialogTitle: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        cancel: 'Отмена',
        stringCaption: 'Строковая подпись',
        templateCaption: 'Шаблонная подпись',
        templateWord: 'шаблон',
        dialogTitle: 'Заголовок диалога',
        longDialogTitle:
            'Заголовок диалога Заголовок диалога Заголовок диалога Заголовок диалога го диалога Заголовок ди го диалога Заголовок ди'
    },
    default: {
        cancel: 'Cancel',
        stringCaption: 'String caption',
        templateCaption: 'Template caption',
        templateWord: 'template',
        dialogTitle: 'Dialog title',
        longDialogTitle: 'Dialog title Dialog title Dialog title Dialog title g title Dialog titl g title Dialog titl'
    }
};
