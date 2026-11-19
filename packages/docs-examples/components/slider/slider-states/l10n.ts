import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    normal: string;
    disabled: string;
    readonly: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        normal: 'Обычное состояние',
        disabled: 'Заблокировано',
        readonly: 'Только для чтения'
    },
    'en-US': {
        normal: 'Normal',
        disabled: 'Disabled',
        readonly: 'Read-only'
    }
};
