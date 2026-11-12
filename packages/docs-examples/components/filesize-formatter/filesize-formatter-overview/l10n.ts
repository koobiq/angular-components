import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the filesize-formatter-overview example. */
export interface ExampleText {
    sizeInBits: string;
    numbersBehindDecimalPoint: string;
    default2: string;
    base: string;
    base10: string;
    base2: string;
    siStandard: string;
    iec: string;
    default10: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        sizeInBits: 'Размер в битах',
        numbersBehindDecimalPoint: 'Знаков после запятой',
        default2: 'По умолчанию (2)',
        base: 'Основание',
        base10: 'Основание 10',
        base2: 'Основание 2',
        siStandard: 'байт = 1000 байт (стандарт SI)',
        iec: 'байт = 1024 байт (IEC)',
        default10: 'По умолчанию (10)'
    },
    default: {
        sizeInBits: 'Size in bits',
        numbersBehindDecimalPoint: 'Numbers behind decimal point',
        default2: 'Default (2)',
        base: 'Base',
        base10: 'Base 10',
        base2: 'Base 2',
        siStandard: 'bytes = 1000 bytes (SI standard)',
        iec: 'bytes = 1024 bytes (IEC)',
        default10: 'Default (10)'
    }
};
