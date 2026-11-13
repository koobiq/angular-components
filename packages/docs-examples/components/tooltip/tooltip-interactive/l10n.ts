import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tooltip-interactive example. */
export interface ExampleTranslation {
    tooltip: string;
    buttonWithTooltip: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        tooltip: 'Тултип',
        buttonWithTooltip: 'Кнопка с тултипом'
    },
    default: {
        tooltip: 'Tooltip',
        buttonWithTooltip: 'Button with a tooltip'
    }
};
