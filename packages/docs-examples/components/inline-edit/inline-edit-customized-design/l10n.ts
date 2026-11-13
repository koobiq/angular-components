import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the inline-edit-customized-design example. */
export interface ExampleTranslation {
    placeholder: string;
    link: string;
    severities: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        link: 'Ссылка',
        severities: ['Критическая', 'Высокая', 'Средняя', 'Низкая']
    },
    default: {
        placeholder: 'Placeholder',
        link: 'Link',
        severities: ['Critical', 'High', 'Medium', 'Low']
    }
};
