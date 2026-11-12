import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the popover examples. Member names stay as proper nouns. */
export interface ExampleText {
    wonder: string;
    save: string;
    cancel: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        wonder: 'Интересно, что это такое?',
        save: 'Сохранить',
        cancel: 'Отмена'
    },
    default: {
        wonder: 'I wonder what this?',
        save: 'Save',
        cancel: 'Cancel'
    }
};
