import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the radio examples. Person names stay as proper nouns; Normal/Big/Error are style names. */
export interface ExampleText {
    fieldLabel: string;
    practiceOptions: { label: string; hint: string }[];
    authenticatorApp: string;
    hardwareKey: string;
    smsCode: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        fieldLabel: 'Подпись поля',
        practiceOptions: [
            {
                label: 'Регулярное обновление программ и операционной системы',
                hint: 'Регулярное обновление программ и операционных систем помогает устранять уязвимости и повышать защиту от потенциальных угроз'
            },
            {
                label: 'Использование надёжных уникальных паролей',
                hint: 'Надёжные уникальные пароли для каждой учётной записи повышают кибербезопасность: атаки часто используют слабые или украденные пароли'
            },
            {
                label: 'Внедрение многофакторной аутентификации (MFA)',
                hint: 'Многофакторная аутентификация требует нескольких форм подтверждения перед доступом к учётной записи, снижая риск несанкционированного доступа'
            }
        ],
        authenticatorApp: 'Приложение-аутентификатор',
        hardwareKey: 'Аппаратный ключ безопасности',
        smsCode: 'Код в текстовом сообщении'
    },
    default: {
        fieldLabel: 'Field label',
        practiceOptions: [
            {
                label: 'Regular software and operating system updates',
                hint: 'Updating software and operating systems regularly helps to patch vulnerabilities and enhance security measures against potential threats'
            },
            {
                label: 'Using strong and unique passwords',
                hint: 'Creating strong and unique passwords for each online account can enhance cybersecurity, as cyber attacks often exploit weak or stolen passwords'
            },
            {
                label: 'Implementing multi-factor authentication (MFA)',
                hint: 'Multi-factor authentication involves multiple identification forms before account access, reducing the risk of unauthorized access'
            }
        ],
        authenticatorApp: 'Authenticator app',
        hardwareKey: 'Hardware security key',
        smsCode: 'Code in a text message'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
