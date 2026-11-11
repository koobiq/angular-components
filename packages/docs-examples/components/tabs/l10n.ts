import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the tabs examples. OS names (macOS, Windows) stay as proper names. */
export interface ExampleText {
    bruteforce: string;
    complexAttack: string;
    ddos: string;
    dos: string;
    hipsAlert: string;
    idsIpsAlert: string;
    zeroDay: string;
    xss: string;
    malware: string;
    vulnExploitation: string;
    tabContent: (name: string) => string;
    tabN: (index: number) => string;
    files: string;
    settings: string;
    tasks: string;
    contentForId: (id: string) => string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        bruteforce: 'Подбор пароля',
        complexAttack: 'Сложная атака',
        ddos: 'DDoS',
        dos: 'DoS',
        hipsAlert: 'HIPS-алерт',
        idsIpsAlert: 'IDS/IPS-алерт',
        zeroDay: 'Эксплойт нулевого дня',
        xss: 'XSS',
        malware: 'Вредоносное ПО',
        vulnExploitation: 'Эксплуатация уязвимости',
        tabContent: (name) => `Содержимое вкладки ${name}`,
        tabN: (index) => `Вкладка ${index}`,
        files: 'Файлы',
        settings: 'Настройки',
        tasks: 'Задачи',
        contentForId: (id) => `Содержимое выбранной вкладки с id: ${id}`
    },
    default: {
        bruteforce: 'BruteForce',
        complexAttack: 'Complex Attack',
        ddos: 'DDoS',
        dos: 'DoS',
        hipsAlert: 'HIPS alert',
        idsIpsAlert: 'IDS/IPS Alert',
        zeroDay: 'Zero-Day Exploit',
        xss: 'XSS',
        malware: 'Malware',
        vulnExploitation: 'Vulnerability Exploitation',
        tabContent: (name) => `${name} tab content`,
        tabN: (index) => `Tab ${index}`,
        files: 'files',
        settings: 'settings',
        tasks: 'tasks',
        contentForId: (id) => `Content for selected tab with id: ${id}`
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
