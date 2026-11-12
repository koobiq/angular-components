import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the tooltip examples. Placement, color and offset names stay English as API values. */
export interface ExampleText {
    tooltip: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        tooltip: 'Тултип'
    },
    default: {
        tooltip: 'Tooltip'
    }
};
