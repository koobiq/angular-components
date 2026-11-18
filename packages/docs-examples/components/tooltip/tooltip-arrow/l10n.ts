import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tooltip-arrow example. */
export interface ExampleTranslation {
    tooltipWithoutArrow: string;
    tooltipWithArrow: string;
    noArrow: string;
    withArrow: string;
    tooltipWithCenteredArrow: string;
    centeredArrow: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        tooltipWithoutArrow: 'Тултип без стрелки',
        tooltipWithArrow: 'Тултип со стрелкой',
        noArrow: 'Без стрелки',
        withArrow: 'Со стрелкой',
        tooltipWithCenteredArrow: 'Тултип с центрированной стрелкой',
        centeredArrow: 'Центрированная стрелка'
    },
    default: {
        tooltipWithoutArrow: 'Tooltip without arrow',
        tooltipWithArrow: 'Tooltip with arrow',
        noArrow: 'No arrow',
        withArrow: 'With arrow',
        tooltipWithCenteredArrow: 'Tooltip with centered arrow',
        centeredArrow: 'Centered arrow'
    }
};
