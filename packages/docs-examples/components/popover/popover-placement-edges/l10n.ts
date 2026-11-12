import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the popover-placement-edges example. */
export interface ExampleTranslation {
    wonder: string;
    save: string;
    cancel: string;
    placeholder: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        wonder: 'Интересно, что это такое?',
        save: 'Сохранить',
        cancel: 'Отмена',
        placeholder: 'Интересная мысль'
    },
    default: {
        wonder: 'I wonder what this?',
        save: 'Save',
        cancel: 'Cancel',
        placeholder: 'Interesting thought'
    }
};
