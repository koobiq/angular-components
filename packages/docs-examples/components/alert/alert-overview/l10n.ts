import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the alert-overview example. */
export interface ExampleText {
    body: string;
    heading: string;
    action: string;
    anotherAction: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        body: 'Если нет заголовка, не ставьте точку в конце последнего предложения. Если сообщение содержит и текст, и заголовок, ставьте точку в конце текста.',
        heading: 'Заголовок',
        action: 'Действие',
        anotherAction: 'Другое действие'
    },
    default: {
        body: 'If there is no heading, do not put a period at the end of the last sentence. If the message contains both body text and a heading, put a period at the end of the body text.',
        heading: 'Heading',
        action: 'Action',
        anotherAction: 'Another action'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
