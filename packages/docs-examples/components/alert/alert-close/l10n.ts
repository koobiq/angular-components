import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the alert examples. */
export interface ExampleText {
    close: string;
    closeHint: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        close: 'Закрыть',
        closeHint: 'Алерт закрывается крестиком в углу; не дублируйте это кнопкой под текстом сообщения'
    },
    default: {
        close: 'Close',
        closeHint:
            'The alert is dismissed with the close icon in the corner; do not duplicate this with a button below the message text'
    }
};
