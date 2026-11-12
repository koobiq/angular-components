import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the popover-arrow-and-offset example. */
export interface ExampleText {
    wonder: string;
    save: string;
    cancel: string;
    arrow: string;
    arrowCentered: string;
    offset: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        wonder: 'Интересно, что это такое?',
        save: 'Сохранить',
        cancel: 'Отмена',
        arrow: 'Стрелка',
        arrowCentered: 'Стрелка по центру',
        offset: 'Смещение'
    },
    default: {
        wonder: 'I wonder what this?',
        save: 'Save',
        cancel: 'Cancel',
        arrow: 'Arrow',
        arrowCentered: 'Arrow centered',
        offset: 'Offset'
    }
};
