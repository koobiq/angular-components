import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the toggle examples. */
export interface ExampleText {
    vibration: string;
    tapToWake: string;
    shakeToUndo: string;
    touch: string;
    tapToWakeHint: string;
    shakeToUndoHint: string;
    vibrationHint: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        vibration: 'Вибрация',
        tapToWake: 'Касание для пробуждения',
        shakeToUndo: 'Встряхнуть для отмены',
        touch: 'Касание',
        tapToWakeHint: 'Будить экран касанием дисплея',
        shakeToUndoHint:
            'Если вы случайно делитесь телефоном, вы можете отключить встряхивание для отмены, чтобы предотвратить появление предупреждения об отмене.',
        vibrationHint:
            'Когда этот переключатель выключен, вся вибрация на телефоне будет отключена, включая оповещения о землетрясениях, цунами и других чрезвычайных ситуациях.'
    },
    default: {
        vibration: 'Vibration',
        tapToWake: 'Tap to wake',
        shakeToUndo: 'Shake to undo',
        touch: 'Touch',
        tapToWakeHint: 'Wake the screen when you tap on the display',
        shakeToUndoHint:
            'If you tend to share your phone by accident, you can disable Shake to Undo to prevent the Undo alert from appearing.',
        vibrationHint:
            'When this switch is off, all vibration on your phone will be disabled, including those for earthquake, tsunami and other emergency alerts.'
    }
};
