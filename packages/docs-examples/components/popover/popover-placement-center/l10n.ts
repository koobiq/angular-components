import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the popover-placement-center example. */
export interface ExampleText {
    wonder: string;
    save: string;
    cancel: string;
    placeholder: string;
}

export const TEXT: LocalizedText<ExampleText> = {
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
