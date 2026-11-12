import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the breadcrumbs-overview example. */
export interface ExampleText {
    main: string;
    standards: string;
    aes: string;
    edit: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
