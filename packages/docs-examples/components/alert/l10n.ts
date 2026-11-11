import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the alert examples. */
export interface ExampleText {
    body: string;
    close: string;
    closeHint: string;
    showAlert: string;
    saveFailed: string;
    uploadFailedTitle: string;
    linkSentence: string;
    linkText: string;
    chooseAnotherFile: string;
    replace: string;
    updateAgentFailed: string;
    retry: string;
    installDifferentVersion: string;
    moduleConfigured: string;
    hypervisors: string;
    recoveryCheck: string;
    shortText: string;
    paragraph1: string;
    paragraph2: string;
    heading: string;
    action: string;
    anotherAction: string;
    information: string;
    warning: string;
    error: string;
    success: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        body: 'Если нет заголовка, не ставьте точку в конце последнего предложения. Если сообщение содержит и текст, и заголовок, ставьте точку в конце текста.',
        close: 'Закрыть',
        closeHint: 'Алерт закрывается крестиком в углу; не дублируйте это кнопкой под текстом сообщения',
        showAlert: 'Показать алерт',
        saveFailed: 'Не удалось сохранить изменения. Попробуйте ещё раз.',
        uploadFailedTitle: 'Не удалось загрузить файл',
        linkSentence: 'Когда гиперссылка стоит в конце предложения, точка принимает цвет ссылки,',
        linkText: 'но не подчёркивается',
        chooseAnotherFile: 'Выбрать другой файл',
        replace: 'Заменить',
        updateAgentFailed: 'Не удалось обновить агент',
        retry: 'Повторить',
        installDifferentVersion: 'Установить другую версию',
        moduleConfigured: 'Модуль настроен в политике',
        hypervisors: 'Гипервизоры',
        recoveryCheck: 'После восстановления проверьте связи групп агентов с политиками',
        shortText: 'Короткий текст в алерте',
        paragraph1:
            'Абзац должен выражать и раскрывать только одну мысль. Если смешать в одном абзаце причины, суть проблемы и возможные решения описываемой ситуации, читатель быстро устанет и, скорее всего, не поймёт, что только что прочитал.',
        paragraph2:
            'Постарайтесь сформулировать ключевую мысль в первом предложении абзаца, затем раскройте её подробнее и подкрепите примерами. Тогда читатель сможет бегло просматривать текст и сразу видеть, о чём каждая часть. Иногда первые предложения абзаца выделяют жирным — это так называемые рубрикационные заголовки.',
        heading: 'Заголовок',
        action: 'Действие',
        anotherAction: 'Другое действие',
        information: 'Информация',
        warning: 'Предупреждение',
        error: 'Ошибка',
        success: 'Успех'
    },
    default: {
        body: 'If there is no heading, do not put a period at the end of the last sentence. If the message contains both body text and a heading, put a period at the end of the body text.',
        close: 'Close',
        closeHint:
            'The alert is dismissed with the close icon in the corner; do not duplicate this with a button below the message text',
        showAlert: 'Show alert',
        saveFailed: 'Failed to save changes. Please try again.',
        uploadFailedTitle: 'Failed to upload the file',
        linkSentence: 'When a hyperlink is at the end of a sentence, the period takes the link color,',
        linkText: 'but is not underlined',
        chooseAnotherFile: 'Choose another file',
        replace: 'Replace',
        updateAgentFailed: 'Failed to update the agent',
        retry: 'Retry',
        installDifferentVersion: 'Install a different version',
        moduleConfigured: 'The module is configured in the policy',
        hypervisors: 'Hypervisors',
        recoveryCheck: "After recovery, check the agent groups' links to policies",
        shortText: 'Short text in the alert',
        paragraph1:
            'A paragraph should convey and develop only one idea. For example, if you mix the causes, the essence of the problem, and possible solutions to the situation you are describing in a single paragraph, the reader will quickly get tired and most likely will not understand what they just read.',
        paragraph2:
            'Try to state the key idea in the first sentence of the paragraph, then expand on it in more detail and back it up with examples. That way the reader can skim the text diagonally and immediately see what each part is about. Sometimes the first sentences of a paragraph are set in bold — these are called run-in headings.',
        heading: 'Heading',
        action: 'Action',
        anotherAction: 'Another action',
        information: 'Information',
        warning: 'Warning',
        error: 'Error',
        success: 'Success'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
