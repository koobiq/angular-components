import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the toggle-validation example. */
export interface ExampleTranslation {
    automaticBackup: string;
    turnOffHint: string;
    backupRequired: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        automaticBackup: 'Автоматическое резервное копирование',
        turnOffHint: 'Выключите, чтобы увидеть ошибку',
        backupRequired: 'Требуется политикой безопасности вашей организации'
    },
    default: {
        automaticBackup: 'Automatic backup',
        turnOffHint: 'Turn it off to see the error',
        backupRequired: 'Required by the security policy of your organization'
    }
};
