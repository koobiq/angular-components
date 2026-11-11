import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the inline-edit-save-error example. */
export interface ExampleText {
    name: string;
    description: string;
    edit: string;
    retry: string;
    discardChanges: string;
    close: string;
    couldntUpdate: string;
    saveErrorIntro1: string;
    saveErrorIntro2: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        name: 'Имя',
        description: 'Описание',
        edit: 'Редактировать',
        retry: 'Повторить',
        discardChanges: 'Отменить изменения',
        close: 'Закрыть',
        couldntUpdate: 'Не удалось обновить поле',
        saveErrorIntro1: 'Сохраните',
        saveErrorIntro2:
            'как имя, чтобы значение было отклонено. Сохранение описания падает с первой попытки и успешно со второй.'
    },
    default: {
        name: 'Name',
        description: 'Description',
        edit: 'Edit',
        retry: 'Retry',
        discardChanges: 'Discard changes',
        close: 'Close',
        couldntUpdate: 'Couldn’t update the field',
        saveErrorIntro1: 'Save',
        saveErrorIntro2:
            'as the name to have the value rejected. Saving the description fails on the first attempt and succeeds on retry.'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
