import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the radio-validation example. */
export interface ExampleText {
    authenticatorApp: string;
    hardwareKey: string;
    smsCode: string;
    saveWithoutChoosing: string;
    chooseSecondFactor: string;
    save: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        authenticatorApp: 'Приложение-аутентификатор',
        hardwareKey: 'Аппаратный ключ безопасности',
        smsCode: 'Код в текстовом сообщении',
        saveWithoutChoosing: 'Сохраните, не выбрав вариант, чтобы увидеть ошибку',
        chooseSecondFactor: 'Выберите второй фактор для защиты учётной записи',
        save: 'Сохранить'
    },
    default: {
        authenticatorApp: 'Authenticator app',
        hardwareKey: 'Hardware security key',
        smsCode: 'Code in a text message',
        saveWithoutChoosing: 'Save without choosing to see the error',
        chooseSecondFactor: 'Choose a second factor to protect the account',
        save: 'Save'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
