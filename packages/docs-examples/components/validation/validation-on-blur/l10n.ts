import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the validation-on-blur example. */
export interface ExampleText {
    ipv4Address: string;
    invalidIp: string;
    numbersAndDots: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
