import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the checkbox examples. */
export interface ExampleText {
    title: string;
    loremIpsum: string;
    allEventTypes: string;
    eventTypes: string[];
    multilineText: string;
    multilineHint: string;
    default: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        title: 'Заголовок',
        loremIpsum: 'Lorem ipsum',
        allEventTypes: 'Все типы событий',
        eventTypes: ['Вредоносное ПО', 'Фишинг', 'Программа-вымогатель'],
        multilineText:
            'Я принимаю условия политики безопасности и признаю ответственность за защиту конфиденциальной информации',
        multilineHint:
            'Ознакомьтесь с нашей политикой безопасности для получения подробной информации о стандартах защиты данных и конфиденциальности. Устанавливая этот флажок, вы подтверждаете, что понимаете и согласны соблюдать все требования безопасности.',
        default: 'По умолчанию'
    },
    default: {
        title: 'Title',
        loremIpsum: 'Lorem ipsum',
        allEventTypes: 'All event types',
        eventTypes: ['Malware', 'Phishing', 'Ransomware'],
        multilineText:
            'I accept the security policy terms and acknowledge the responsibility to safeguard sensitive information',
        multilineHint:
            'Please review our security policy for detailed information about data protection and privacy standards. By checking this box, you confirm that you understand and agree to comply with all security requirements.',
        default: 'Default'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
