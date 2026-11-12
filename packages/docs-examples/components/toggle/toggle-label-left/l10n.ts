import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the toggle examples. */
export interface ExampleText {
    vibration: string;
    tapToWake: string;
    shakeToUndo: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        vibration: 'Вибрация',
        tapToWake: 'Касание для пробуждения',
        shakeToUndo: 'Встряхнуть для отмены'
    },
    default: {
        vibration: 'Vibration',
        tapToWake: 'Tap to wake',
        shakeToUndo: 'Shake to undo'
    }
};
