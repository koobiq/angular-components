import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the breadcrumbs-overview example. */
export interface ExampleText {
    main: string;
    standards: string;
    aes: string;
    edit: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        main: 'Главная',
        standards: 'Стандарты',
        aes: 'Стандарт расширенного шифрования',
        edit: 'Редактирование'
    },
    default: {
        main: 'Main',
        standards: 'Standards',
        aes: 'Advanced Encryption Standard',
        edit: 'Edit'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
