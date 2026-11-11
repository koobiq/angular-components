import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the badge examples. Color and size names (Theme, Fade Error, Compact) stay English as API names. */
export interface ExampleText {
    normal: string;
    badge: string;
    horizontal: string;
    vertical: string;
    column: (index: number) => string;
    value: string;
    link: string;
    phishingResource: string;
    processListAttempt: string;
    dosTooltip: string;
    categories: string[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        normal: 'Обычный',
        badge: 'Бейдж',
        horizontal: 'Горизонтально',
        vertical: 'Вертикально',
        column: (index) => `Столбец ${index}`,
        value: 'Значение',
        link: 'Ссылка',
        phishingResource: 'EXT. Использование фишинговых ресурсов (phishingAttacks)',
        processListAttempt:
            'Обнаружена попытка получить список процессов, запущенных в системе, на узле qa-kolobok.mpqa.rd.koobiq.com',
        dosTooltip:
            'DoS (аббр. англ. denial-of-service attack «отказ в обслуживании») — хакерская атака на вычислительную систему с целью довести ее до отказа, то есть создание таких условий, при которых добросовестные пользователи системы не смогут получить доступ к предоставляемым системным ресурсам (серверам), либо этот доступ будет затруднен',
        categories: [
            'Подбор пароля',
            'Сложная атака',
            'DDoS',
            'DoS',
            'HIPS-алерт',
            'IDS/IPS-алерт',
            'Кража учётных данных',
            'Разное',
            'Сетевая атака',
            'Пост-компрометация'
        ]
    },
    default: {
        normal: 'Normal',
        badge: 'Badge',
        horizontal: 'Horizontal',
        vertical: 'Vertical',
        column: (index) => `Column ${index}`,
        value: 'Value',
        link: 'Link',
        phishingResource: 'EXT. Use of phishing resources (phishingAttacks)',
        processListAttempt:
            'An attempt to get the list of processes running on the system was detected on host qa-kolobok.mpqa.rd.koobiq.com',
        dosTooltip:
            'DoS (abbreviation of English denial-of-service attack) is a hacker attack on a computing system aimed at bringing it to failure, i.e. creating conditions under which legitimate users of the system cannot access the provided system resources (servers), or this access is difficult',
        categories: [
            'Bruteforce',
            'Complex Attack',
            'DDoS',
            'DoS',
            'HIPS Alert',
            'IDS/IPS Alert',
            'Identity Theft',
            'Miscellaneous',
            'Network Attack',
            'Post Compromise'
        ]
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
