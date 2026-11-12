import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the modal-component example. */
export interface ExampleText {
    save: string;
    close: string;
    openModal: string;
    dosTitle: string;
    dosText: string;
    textNormal: string;
    caption: string;
    header: string;
    disabled: string;
    point2: string;
    point3: string;
    link: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        save: 'Сохранить',
        close: 'Закрыть',
        openModal: 'Открыть модалку',
        dosTitle: 'Атака DoS',
        dosText:
            'В информатике атака отказа в обслуживании (атака DoS) — это кибератака, в которой злоумышленник стремится сделать машину или сетевой ресурс недоступными для предполагаемых пользователей, временно или бессрочно нарушая работу служб узла, подключённого к сети.',
        textNormal: 'Обычный текст',
        caption: 'Подпись',
        header: 'Заголовок',
        disabled: 'Отключено',
        point2: 'Пункт 2',
        point3: 'Пункт 3',
        link: 'Ссылка'
    },
    default: {
        save: 'Save',
        close: 'Close',
        openModal: 'Open Modal',
        dosTitle: 'DoS attack',
        dosText:
            'In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network.',
        textNormal: 'Text Normal',
        caption: 'Caption',
        header: 'Header',
        disabled: 'Disabled',
        point2: 'Point 2',
        point3: 'Point 3',
        link: 'Link'
    }
};
