import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the toggle-validation example. */
export interface ExampleText {
    automaticBackup: string;
    turnOffHint: string;
    backupRequired: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
