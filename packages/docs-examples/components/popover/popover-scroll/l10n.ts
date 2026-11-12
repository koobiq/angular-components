import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the popover-scroll example. */
export interface ExampleTranslation {
    wonder: string;
    save: string;
    cancel: string;
    placeholder: string;
    noCloseOnScroll: string;
    closeOnScroll: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        wonder: 'Интересно, что это такое?',
        save: 'Сохранить',
        cancel: 'Отмена',
        placeholder: 'Интересная мысль',
        noCloseOnScroll: 'Поповер не закрывается при прокрутке',
        closeOnScroll: 'Закрывается при прокрутке'
    },
    default: {
        wonder: 'I wonder what this?',
        save: 'Save',
        cancel: 'Cancel',
        placeholder: 'Interesting thought',
        noCloseOnScroll: 'Popover does not close on scroll',
        closeOnScroll: 'Closes on scroll'
    }
};
