import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the breadcrumbs-overview example. */
export interface ExampleTranslation {
    main: string;
    standards: string;
    aes: string;
    edit: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
