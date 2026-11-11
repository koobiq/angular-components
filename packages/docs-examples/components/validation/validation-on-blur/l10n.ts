import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** Text of the validation-on-blur example. */
export interface ExampleText {
    ipv4Address: string;
    invalidIp: string;
    numbersAndDots: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        ipv4Address: 'IPv4-адрес',
        invalidIp: 'IP-адрес не соответствует стандарту RFC',
        numbersAndDots: 'Только цифры и точки'
    },
    default: {
        ipv4Address: 'IPv4-address',
        invalidIp: 'The IP address does not comply with RFC standards',
        numbersAndDots: 'Numbers and dots only'
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
