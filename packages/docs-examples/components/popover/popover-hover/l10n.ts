import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the popover-hover example. */
export interface ExampleTranslation {
    wonder: string;
    save: string;
    cancel: string;
    placeholder: string;
    open: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        wonder: 'Интересно, что это такое?',
        save: 'Сохранить',
        cancel: 'Отмена',
        placeholder: 'Интересная мысль',
        open: 'Открыть поповер'
    },
    default: {
        wonder: 'I wonder what this?',
        save: 'Save',
        cancel: 'Cancel',
        placeholder: 'Interesting thought',
        open: 'Open popover'
    }
};
