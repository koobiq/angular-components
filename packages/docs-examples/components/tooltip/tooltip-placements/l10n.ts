import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the tooltip examples. Placement, color and offset names stay English as API values. */
export interface ExampleTranslation {
    longTooltip: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        longTooltip:
            'Тултип — это подсказка, которая появляется при наведении указателя или фокусе на элемент интерфейса. Тултип не может содержать интерактивные элементы.'
    },
    default: {
        longTooltip:
            'A tooltip is a hint that appears when the pointer hovers over or focuses on an interface element. A tooltip cannot contain interactive elements.'
    }
};
