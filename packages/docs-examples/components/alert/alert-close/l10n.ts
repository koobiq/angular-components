import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the alert examples. */
export interface ExampleTranslation {
    close: string;
    closeHint: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
