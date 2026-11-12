import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the skeleton-accordion example. */
export interface ExampleText {
    loading: string;
    accordionSections: { title: string; content: string }[];
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        loading: 'Загрузка',
        accordionSections: [
            { title: 'Подключение', content: 'Адрес сервера, порт и тип подключения.' },
            { title: 'Синхронизация', content: 'Как часто обновляются пользователи и группы каталога.' },
            { title: 'Аутентификация', content: 'Кто может войти с учётной записью каталога.' }
        ]
    },
    default: {
        loading: 'Loading',
        accordionSections: [
            { title: 'Connection', content: 'The server address, the port and the type of the connection.' },
            { title: 'Synchronization', content: 'How often the users and the groups of the directory are updated.' },
            { title: 'Authentication', content: 'Who is allowed to sign in with an account of the directory.' }
        ]
    }
};
