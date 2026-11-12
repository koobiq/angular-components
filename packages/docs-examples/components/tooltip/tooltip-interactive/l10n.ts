import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the tooltip-interactive example. */
export interface ExampleText {
    tooltip: string;
    buttonWithTooltip: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        tooltip: 'Тултип',
        buttonWithTooltip: 'Кнопка с тултипом'
    },
    default: {
        tooltip: 'Tooltip',
        buttonWithTooltip: 'Button with a tooltip'
    }
};
