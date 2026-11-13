import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the radio-validation example. */
export interface ExampleTranslation {
    authenticatorApp: string;
    hardwareKey: string;
    smsCode: string;
    saveWithoutChoosing: string;
    chooseSecondFactor: string;
    save: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
