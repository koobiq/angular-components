import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the breadcrumbs examples. Acronyms (RBAC, ABAC, AES) and hashes stay as-is. */
export interface ExampleText {
    informationSecurity: string;
    accessControl: string;
    authorization: string;
    roles: string;
    main: string;
    standards: string;
    aes: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        informationSecurity: 'Информационная безопасность',
        accessControl: 'Контроль доступа',
        authorization: 'Авторизация',
        roles: 'Роли',
        main: 'Главная',
        standards: 'Стандарты',
        aes: 'Стандарт расширенного шифрования'
    },
    default: {
        informationSecurity: 'Information Security',
        accessControl: 'Access Control',
        authorization: 'Authorization',
        roles: 'Roles',
        main: 'Main',
        standards: 'Standards',
        aes: 'Advanced Encryption Standard'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
