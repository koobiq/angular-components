import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the sidepanel-with-dynamic-config-update example. */
export interface ExampleText {
    header: string;
    close: string;
    open: string;
    disableClose: string;
    openAnother: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        header: 'Заголовок',
        close: 'Закрыть',
        open: 'Открыть',
        disableClose: 'Отключить закрытие',
        openAnother: 'Открыть другую панель'
    },
    default: {
        header: 'Header',
        close: 'Close',
        open: 'Open',
        disableClose: 'Disable close',
        openAnother: 'Open another sidepanel'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
