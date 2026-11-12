import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the breadcrumbs-with-auto-wrap-adaptive example. */
export interface ExampleText {
    main: string;
    standards: string;
    aes: string;
    edit: string;
    test: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
