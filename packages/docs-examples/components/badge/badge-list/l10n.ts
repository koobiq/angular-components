import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the badge-list example. */
export interface ExampleText {
    horizontal: string;
    vertical: string;
    categories: string[];
}

export const TEXT: LocalizedText<ExampleText> = {
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
