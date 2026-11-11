import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the breadcrumbs-with-wrap example. */
export interface ExampleText {
    main: string;
    standards: string;
    aes: string;
    edit: string;
    test: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        main: 'Главная',
        standards: 'Стандарты',
        aes: 'Стандарт расширенного шифрования',
        edit: 'Редактирование',
        test: 'Тест'
    },
    default: {
        main: 'Main',
        standards: 'Standards',
        aes: 'Advanced Encryption Standard',
        edit: 'Edit',
        test: 'Test'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
