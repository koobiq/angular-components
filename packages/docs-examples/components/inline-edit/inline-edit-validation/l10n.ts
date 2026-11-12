import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the inline-edit-validation example. */
export interface ExampleText {
    placeholder: string;
    notEmpty: string;
    ipAddress: string;
    errorMessage: string;
    invalidIpRfc: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        notEmpty: 'Не пусто',
        ipAddress: 'IP-адрес',
        errorMessage: 'Сообщение об ошибке',
        invalidIpRfc: 'Некорректный IP: не соответствует RFC'
    },
    default: {
        placeholder: 'Placeholder',
        notEmpty: 'Not empty',
        ipAddress: 'IP-address',
        errorMessage: 'Error message',
        invalidIpRfc: 'Invalid IP: RFC non-compliant'
    }
};
