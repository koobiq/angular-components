import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the validation-on-blur-filled example. */
export interface ExampleText {
    ipv4Address: string;
    invalidIp: string;
    numbersAndDot: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
