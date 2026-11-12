import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the tooltip-offset example. */
export interface ExampleTranslation {
    tooltip: string;
    default: string;
    defaultWithArrow: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
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
