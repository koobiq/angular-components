import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the toast-user-data example. */
export interface ExampleText {
    agentUpdateAvailable: string;
    version20315: string;
    showToast: string;
    update: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        agentUpdateAvailable: 'Доступно обновление агента',
        version20315: 'Версия 2.03.15 от 15 мая 2022',
        showToast: 'Показать тост',
        update: 'Обновить'
    },
    default: {
        agentUpdateAvailable: 'Agent update available',
        version20315: 'Version 2.03.15 from May 15, 2022',
        showToast: 'Show toast',
        update: 'Update'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
