import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the badge examples. Color and size names (Theme, Fade Error, Compact) stay English as API names. */
export interface ExampleText {
    normal: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        normal: 'Обычный'
    },
    default: {
        normal: 'Normal'
    }
};
