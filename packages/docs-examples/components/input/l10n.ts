import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the input examples. */
export interface ExampleText {
    numberWithBounds: string;
    hintBounds: string;
    numberWithSeparator: string;
    numberWithoutSeparator: string;
    integer: string;
    placeholder: string;
    showPassword: string;
    hidePassword: string;
    from8to15: string;
    uppercaseLatin: string;
    lowercaseLatin: string;
    digit: string;
    special: string;
    latinOnly: string;
    password: string;
    readonly: string;
    text: string;
    number: string;
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

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        numberWithBounds: 'С разделением групп разрядов, с мин. и макс. ограничением',
        hintBounds: 'От −12 000 до 12 000',
        numberWithSeparator: 'С разделителем групп разрядов',
        numberWithoutSeparator: 'Без разделителя групп разрядов',
        integer: 'Целочисленное значение',
        placeholder: 'Плейсхолдер',
        showPassword: 'Показать пароль',
        hidePassword: 'Скрыть пароль',
        from8to15: 'От 8 до 15 символов',
        uppercaseLatin: 'Заглавная латинская буква',
        lowercaseLatin: 'Строчная латинская буква',
        digit: 'Цифра',
        special: 'Специальный символ',
        latinOnly: 'Только латинские буквы, цифры, пробелы и спецсимволы',
        password: 'Пароль',
        readonly: 'Только для чтения',
        text: 'Текст',
        number: 'Число',
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
        numberWithBounds: 'With thousand separators, with min and max bounds',
        hintBounds: 'From −12,000 to 12,000',
        numberWithSeparator: 'With thousand separator',
        numberWithoutSeparator: 'Without thousand separator',
        integer: 'Integer value',
        placeholder: 'Placeholder',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        from8to15: '8 to 15 characters',
        uppercaseLatin: 'An uppercase letter',
        lowercaseLatin: 'A lowercase letter',
        digit: 'A digit',
        special: 'A special character',
        latinOnly: 'Only latin letters, digits, spaces and special characters',
        password: 'Password',
        readonly: 'Readonly',
        text: 'Text',
        number: 'Number',
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

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
