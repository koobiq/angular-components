import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the radio examples. Person names stay as proper nouns; Normal/Big/Error are style names. */
export interface ExampleTranslation {
    practiceOptions: { label: string; hint: string }[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
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
        ]
    },
    default: {
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
        ]
    }
};
