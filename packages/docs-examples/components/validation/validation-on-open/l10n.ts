import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the validation-on-open example. */
export interface ExampleText {
    name: string;
    surname: string;
    save: string;
    cancel: string;
    openEmptyForm: string;
    openDraft: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
