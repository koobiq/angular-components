import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the inline-edit-customized-design example. */
export interface ExampleText {
    placeholder: string;
    link: string;
    severities: string[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
