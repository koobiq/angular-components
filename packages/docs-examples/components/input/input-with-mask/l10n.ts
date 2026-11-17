import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the input-with-mask example. */
export interface ExampleTranslation {
    ipAddress: string;
    macAddress: string;
    ipv6Address: string;
    port: string;
    licenseKey: string;
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
        ipAddress: 'IP-адрес',
        macAddress: 'MAC-адрес',
        ipv6Address: 'IPv6-адрес',
        port: 'Порт',
        licenseKey: 'Лицензионный ключ',
        format: 'Формат:',
        range: 'Диапазон: 0-65535',
        useArrows: 'Используйте ↑/↓ для увеличения или уменьшения значения',
        invalidIp: 'Некорректный IP-адрес',
        invalidMac: 'Некорректный MAC-адрес',
        invalidIpv6: 'Некорректный IPv6-адрес',
        invalidLicense: 'Некорректный лицензионный ключ'
    },
    default: {
        ipAddress: 'IP address',
        macAddress: 'MAC address',
        ipv6Address: 'IPv6 address',
        port: 'Port',
        licenseKey: 'License key',
        format: 'Format:',
        range: 'Range: 0-65535',
        useArrows: 'Use ↑/↓ to increase or decrease the value',
        invalidIp: 'Invalid IP address',
        invalidMac: 'Invalid MAC address',
        invalidIpv6: 'Invalid IPv6 address',
        invalidLicense: 'Invalid license key'
    }
};
