import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the popover examples. Member names stay as proper nouns. */
export interface ExampleText {
    wonder: string;
    save: string;
    cancel: string;
    arrow: string;
    offset: string;
    informationAbout: (owner: string) => string;
    pageTitle: string;
    hybridRemote: string;
    shareProject: string;
    email: string;
    sendInvite: string;
    members: string;
    editor: string;
    viewer: string;
    videoConferencing: string;
    aroundInclusive: string;
    privacy: string;
    encryptedCalls: string;
    giveAccess: string;
    closeBigTitle: string;
    closeShare: string;
    placeholder: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        wonder: 'Интересно, что это такое?',
        save: 'Сохранить',
        cancel: 'Отмена',
        arrow: 'Стрелка',
        offset: 'Смещение',
        informationAbout: (owner) => `Информация о ${owner}.`,
        pageTitle: 'Заголовок страницы',
        hybridRemote: 'Гибридно-удалённая работа для всех с уникальной аудиотехнологией',
        shareProject: 'Поделиться проектом',
        email: 'Эл. почта',
        sendInvite: 'Отправить приглашение',
        members: 'Участники',
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
        closeShare: 'Крестик в углу в окне «Поделиться»',
        placeholder: 'Интересная мысль'
    },
    default: {
        wonder: 'I wonder what this?',
        save: 'Save',
        cancel: 'Cancel',
        arrow: 'Arrow',
        offset: 'Offset',
        informationAbout: (owner) => `Information about ${owner}.`,
        pageTitle: 'Page Title',
        hybridRemote: 'Making hybrid‑remote inclusive with unique audio technology',
        shareProject: 'Share project',
        email: 'Email',
        sendInvite: 'Send invite',
        members: 'Members',
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
        closeShare: 'Close button in the corner in the Share window',
        placeholder: 'Interesting thought'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
