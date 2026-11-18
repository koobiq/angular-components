import { Translations } from '@koobiq/docs-examples/i18n';

/** Markdown source of the examples, keyed by example. */
export interface ExampleTranslation {
    headersCombinations: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        headersCombinations: `## Система защиты данных
### Уровни безопасности
#### Типы угроз

Рекомендуемая длина пароля — 12 символов, длина ключа шифрования — 256 бит. Слабые пароли не отклоняются, система повышает требования безопасности.

### Обнаружение атак

Мониторинг происходит в реальном времени. Несколько инцидентов формируют единую картину угроз. Новые события отображаются в журнале безопасности. Если угроз много, критические выделяются с приоритетом. Чаще всего атаки обнаруживаются автоматически, но администратор может запустить ручную проверку.`
    },
    default: {
        headersCombinations: `## Data Protection System
### Security Levels
#### Threat Types

Recommended password length is 12 characters, encryption key length is 256 bits. Weak passwords are not rejected, the system raises security requirements.

### Attack Detection

Monitoring happens in real time. Multiple incidents form a unified threat picture. New events are displayed in the security log. If there are many threats, critical ones are highlighted with priority. Most often attacks are detected automatically, but an administrator can initiate a manual check.`
    }
};
