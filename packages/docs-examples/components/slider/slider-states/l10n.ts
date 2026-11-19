import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    normal: string;
    error: string;
    disabled: string;
    readonly: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        normal: 'Обычное состояние',
        error: 'Ошибка',
        disabled: 'Заблокировано',
        readonly: 'Только для чтения'
    },
    'en-US': {
        normal: 'Normal',
        error: 'Invalid',
        disabled: 'Disabled',
        readonly: 'Read-only'
    }
};
