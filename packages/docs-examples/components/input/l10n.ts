import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the input examples. */
export interface ExampleText {
    placeholder: string;
    showPassword: string;
    hidePassword: string;
    from8to15: string;
    uppercaseLatin: string;
    lowercaseLatin: string;
    password: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        placeholder: 'Плейсхолдер',
        showPassword: 'Показать пароль',
        hidePassword: 'Скрыть пароль',
        from8to15: 'От 8 до 15 символов',
        uppercaseLatin: 'Заглавная латинская буква',
        lowercaseLatin: 'Строчная латинская буква',
        password: 'Пароль'
    },
    default: {
        placeholder: 'Placeholder',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        from8to15: '8 to 15 characters',
        uppercaseLatin: 'An uppercase letter',
        lowercaseLatin: 'A lowercase letter',
        password: 'Password'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
