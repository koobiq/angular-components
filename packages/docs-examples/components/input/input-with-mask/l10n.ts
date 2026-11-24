import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the input-with-mask example. */
export interface ExampleTranslation {
    amount: string;
    percent: string;
    phone: string;
    ipv4Address: string;
    macAddress: string;
    ipv6Address: string;
    port: string;
    licenseKey: string;
    placeholder: string;
    format: string;
    range: string;
    useArrows: string;
    invalidIp: string;
    invalidMac: string;
    invalidIpv6: string;
    invalidLicense: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        amount: 'Сумма',
        percent: 'Проценты',
        phone: 'Телефон',
        ipv4Address: 'IPv4-адрес',
        macAddress: 'MAC-адрес',
        ipv6Address: 'IPv6-адрес',
        port: 'Порт',
        licenseKey: 'Лицензионный ключ',
        placeholder: 'Placeholder',
        format: 'Формат:',
        range: 'Диапазон: 0-65535',
        useArrows: 'Используйте ↑/↓ для увеличения или уменьшения значения',
        invalidIp: 'Некорректный IP-адрес',
        invalidMac: 'Некорректный MAC-адрес',
        invalidIpv6: 'Некорректный IPv6-адрес',
        invalidLicense: 'Некорректный лицензионный ключ'
    },
    default: {
        amount: 'Amount',
        percent: 'Percent',
        phone: 'Phone',
        ipv4Address: 'IPv4 address',
        macAddress: 'MAC address',
        ipv6Address: 'IPv6 address',
        port: 'Port',
        licenseKey: 'License key',
        placeholder: 'Placeholder',
        format: 'Format:',
        range: 'Range: 0-65535',
        useArrows: 'Use ↑/↓ to increase or decrease the value',
        invalidIp: 'Invalid IP address',
        invalidMac: 'Invalid MAC address',
        invalidIpv6: 'Invalid IPv6 address',
        invalidLicense: 'Invalid license key'
    }
};
