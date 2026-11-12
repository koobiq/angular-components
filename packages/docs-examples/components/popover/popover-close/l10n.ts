import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the popover-close example. */
export interface ExampleText {
    shareProject: string;
    email: string;
    sendInvite: string;
    members: string;
    hybridRemote: string;
    editor: string;
    viewer: string;
    videoConferencing: string;
    aroundInclusive: string;
    privacy: string;
    encryptedCalls: string;
    giveAccess: string;
    closeBigTitle: string;
    closeShare: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        shareProject: 'Поделиться проектом',
        email: 'Эл. почта',
        sendInvite: 'Отправить приглашение',
        members: 'Участники',
        hybridRemote: 'Гибридно-удалённая работа для всех с уникальной аудиотехнологией',
        editor: 'Редактор',
        viewer: 'Читатель',
        videoConferencing:
            'Традиционные видеоконференции могут заставлять удалённых коллег чувствовать себя гражданами второго сорта',
        aroundInclusive:
            'Around создан быть инклюзивным, чтобы удалённые участники команды по-настоящему чувствовали себя частью группы. Используя своё устройство, каждый виден и слышен отчётливо — и никто не звучит «далеко от микрофона». Все остаются вовлечёнными. Никто не затмевает других.',
        privacy:
            'Мы серьёзно относимся к конфиденциальности и безопасности. Мы используем отраслевые стандарты политик безопасности данных, чтобы защищать все данные клиентов, и придаём защите конфиденциальности пользователей первостепенное значение. Подробнее о нашей политике конфиденциальности можно узнать здесь.',
        encryptedCalls:
            'Зашифрованные звонки и общение. Все звонки (включая аудио и видео) защищены TLS и шифрованием AES-128.',
        giveAccess: 'Дайте команде доступ к проекту и начните сотрудничать в реальном времени',
        closeBigTitle: 'Крестик в углу с большим заголовком',
        closeShare: 'Крестик в углу в окне «Поделиться»'
    },
    default: {
        shareProject: 'Share project',
        email: 'Email',
        sendInvite: 'Send invite',
        members: 'Members',
        hybridRemote: 'Making hybrid‑remote inclusive with unique audio technology',
        editor: 'Editor',
        viewer: 'Viewer',
        videoConferencing: 'Traditional video conferencing can make remote colleagues feel like second-class citizens',
        aroundInclusive:
            'Around is designed to be inclusive, so remote team members truly feel like part of the group. By being able to use your own device, everyone is seen and heard clearly — and no one ever sounds “far from the mic.” Everyone stays engaged. No one steals the spotlight.',
        privacy:
            'We take privacy and security very seriously. We leverage industry standard data security policies to keep all customer data safe and treat the protection of user privacy and data with the utmost importance. You can learn more about our privacy policy here.',
        encryptedCalls:
            'Encrypted Calls & Communication. All calls (including audio/video) are secured with TLS and AES-128 encryption.',
        giveAccess: 'Give your teammates access to the project and start collaborating in real time',
        closeBigTitle: 'Close button in the corner with a big title',
        closeShare: 'Close button in the corner in the Share window'
    }
};
