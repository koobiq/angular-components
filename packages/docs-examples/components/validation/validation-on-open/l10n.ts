import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the validation-on-open example. */
export interface ExampleText {
    name: string;
    surname: string;
    save: string;
    cancel: string;
    openEmptyForm: string;
    openDraft: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        name: 'Имя',
        surname: 'Фамилия',
        save: 'Сохранить',
        cancel: 'Отмена',
        openEmptyForm: 'Открыть пустую форму',
        openDraft: 'Открыть черновик'
    },
    default: {
        name: 'Name',
        surname: 'Surname',
        save: 'Save',
        cancel: 'Cancel',
        openEmptyForm: 'Open empty form',
        openDraft: 'Open draft'
    }
};
