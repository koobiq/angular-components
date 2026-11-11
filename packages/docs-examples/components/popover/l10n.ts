import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the popover examples. Member names stay as proper nouns. */
export interface ExampleText {
    wonder: string;
    save: string;
    cancel: string;
    shareProject: string;
    email: string;
    sendInvite: string;
    members: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        wonder: 'Интересно, что это такое?',
        save: 'Сохранить',
        cancel: 'Отмена',
        shareProject: 'Поделиться проектом',
        email: 'Эл. почта',
        sendInvite: 'Отправить приглашение',
        members: 'Участники'
    },
    default: {
        wonder: 'I wonder what this?',
        save: 'Save',
        cancel: 'Cancel',
        shareProject: 'Share project',
        email: 'Email',
        sendInvite: 'Send invite',
        members: 'Members'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
