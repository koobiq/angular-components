import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the badge-list example. */
export interface ExampleText {
    horizontal: string;
    vertical: string;
    categories: string[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        horizontal: 'Горизонтально',
        vertical: 'Вертикально',
        categories: [
            'Подбор пароля',
            'Сложная атака',
            'DDoS',
            'DoS',
            'HIPS-алерт',
            'IDS/IPS-алерт',
            'Кража учётных данных',
            'Разное',
            'Сетевая атака',
            'Пост-компрометация'
        ]
    },
    default: {
        horizontal: 'Horizontal',
        vertical: 'Vertical',
        categories: [
            'Bruteforce',
            'Complex Attack',
            'DDoS',
            'DoS',
            'HIPS Alert',
            'IDS/IPS Alert',
            'Identity Theft',
            'Miscellaneous',
            'Network Attack',
            'Post Compromise'
        ]
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
