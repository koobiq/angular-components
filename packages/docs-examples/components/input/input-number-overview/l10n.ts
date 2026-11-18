import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the input-number-overview example. */
export interface ExampleTranslation {
    numberWithBounds: string;
    hintBounds: string;
    numberWithSeparator: string;
    numberWithoutSeparator: string;
    integer: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        numberWithBounds: 'С разделением групп разрядов, с мин. и макс. ограничением',
        hintBounds: 'От −12 000 до 12 000',
        numberWithSeparator: 'С разделителем групп разрядов',
        numberWithoutSeparator: 'Без разделителя групп разрядов',
        integer: 'Целочисленное значение'
    },
    default: {
        numberWithBounds: 'With thousand separators, with min and max bounds',
        hintBounds: 'From −12,000 to 12,000',
        numberWithSeparator: 'With thousand separator',
        numberWithoutSeparator: 'Without thousand separator',
        integer: 'Integer value'
    }
};
