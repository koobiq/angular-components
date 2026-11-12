import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the inline-edit-customized-design example. */
export interface ExampleText {
    placeholder: string;
    link: string;
    severities: string[];
}

export const TEXT: LocalizedText<ExampleText> = {
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
