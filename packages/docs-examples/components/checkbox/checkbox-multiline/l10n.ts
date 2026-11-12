import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the checkbox examples. */
export interface ExampleText {
    multilineText: string;
    multilineHint: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        multilineText:
            'Я принимаю условия политики безопасности и признаю ответственность за защиту конфиденциальной информации',
        multilineHint:
            'Ознакомьтесь с нашей политикой безопасности для получения подробной информации о стандартах защиты данных и конфиденциальности. Устанавливая этот флажок, вы подтверждаете, что понимаете и согласны соблюдать все требования безопасности.'
    },
    default: {
        multilineText:
            'I accept the security policy terms and acknowledge the responsibility to safeguard sensitive information',
        multilineHint:
            'Please review our security policy for detailed information about data protection and privacy standards. By checking this box, you confirm that you understand and agree to comply with all security requirements.'
    }
};
