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
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        body: 'Если нет заголовка, не ставьте точку в конце последнего предложения. Если сообщение содержит и текст, и заголовок, ставьте точку в конце текста.',
        close: 'Закрыть',
        closeHint: 'Алерт закрывается крестиком в углу; не дублируйте это кнопкой под текстом сообщения',
        showAlert: 'Показать алерт',
        saveFailed: 'Не удалось сохранить изменения. Попробуйте ещё раз.',
        uploadFailedTitle: 'Не удалось загрузить файл',
        linkSentence: 'Когда гиперссылка стоит в конце предложения, точка принимает цвет ссылки,'
    },
    default: {
        body: 'If there is no heading, do not put a period at the end of the last sentence. If the message contains both body text and a heading, put a period at the end of the body text.',
        close: 'Close',
        closeHint:
            'The alert is dismissed with the close icon in the corner; do not duplicate this with a button below the message text',
        showAlert: 'Show alert',
        saveFailed: 'Failed to save changes. Please try again.',
        uploadFailedTitle: 'Failed to upload the file',
        linkSentence: 'When a hyperlink is at the end of a sentence, the period takes the link color,'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
