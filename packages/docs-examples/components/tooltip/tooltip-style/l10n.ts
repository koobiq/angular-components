import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the tooltip examples. Placement, color and offset names stay English as API values. */
export interface ExampleTranslation {
    tooltip: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        tooltip: 'Тултип'
    },
    default: {
        tooltip: 'Tooltip'
    }
};
