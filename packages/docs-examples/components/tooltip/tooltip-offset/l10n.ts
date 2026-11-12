import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the tooltip-offset example. */
export interface ExampleText {
    tooltip: string;
    default: string;
    defaultWithArrow: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        tooltip: 'Тултип',
        default: 'По умолчанию',
        defaultWithArrow: 'По умолчанию со стрелкой'
    },
    default: {
        tooltip: 'Tooltip',
        default: 'Default',
        defaultWithArrow: 'Default with arrow'
    }
};
