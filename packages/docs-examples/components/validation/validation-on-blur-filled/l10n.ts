import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the validation-on-blur-filled example. */
export interface ExampleText {
    ipv4Address: string;
    invalidIp: string;
    numbersAndDot: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        ipv4Address: 'IPv4-адрес',
        invalidIp: 'IP-адрес не соответствует стандарту RFC',
        numbersAndDot: 'Только цифры и точка'
    },
    default: {
        ipv4Address: 'IPv4-address',
        invalidIp: 'The IP address does not comply with RFC standards',
        numbersAndDot: 'Numbers and dot only'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
