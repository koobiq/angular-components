import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the alert-status example. */
export interface ExampleText {
    body: string;
    information: string;
    warning: string;
    error: string;
    success: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        body: 'Если нет заголовка, не ставьте точку в конце последнего предложения. Если сообщение содержит и текст, и заголовок, ставьте точку в конце текста.',
        information: 'Информация',
        warning: 'Предупреждение',
        error: 'Ошибка',
        success: 'Успех'
    },
    default: {
        body: 'If there is no heading, do not put a period at the end of the last sentence. If the message contains both body text and a heading, put a period at the end of the body text.',
        information: 'Information',
        warning: 'Warning',
        error: 'Error',
        success: 'Success'
    }
};
