import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the inline-edit-validation example. */
export interface ExampleText {
    placeholder: string;
    notEmpty: string;
    ipAddress: string;
    errorMessage: string;
    invalidIpRfc: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
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

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
