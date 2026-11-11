import { computed, Signal } from '@angular/core';
import { kbqInjectLocaleService } from '@koobiq/components/core';

/** Resolves `data` for the active locale of the examples, falling back to `default` (English). */
export const injectLocalizedText = <T>(data: Record<string, T> & { default: T }): Signal<T> => {
    const localeService = kbqInjectLocaleService({ optional: true });

    return computed(() => data[localeService?.localeId() ?? 'default'] ?? data.default);
};

/** Text shown by the tooltip examples. Placement, color and offset names stay English as API values. */
export interface ExampleText {
    tooltip: string;
    tooltipWithoutArrow: string;
    tooltipWithArrow: string;
    noArrow: string;
    add: string;
    create: string;
    longTooltip: string;
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        tooltip: 'Тултип',
        tooltipWithoutArrow: 'Тултип без стрелки',
        tooltipWithArrow: 'Тултип со стрелкой',
        noArrow: 'Без стрелки',
        add: 'Добавить',
        create: 'Создать',
        longTooltip:
            'Тултип — это подсказка, которая появляется при наведении указателя или фокусе на элемент интерфейса. Тултип не может содержать интерактивные элементы.'
    },
    default: {
        tooltip: 'Tooltip',
        tooltipWithoutArrow: 'Tooltip without arrow',
        tooltipWithArrow: 'Tooltip with arrow',
        noArrow: 'No arrow',
        add: 'Add',
        create: 'Create',
        longTooltip:
            'A tooltip is a hint that appears when the pointer hovers over or focuses on an interface element. A tooltip cannot contain interactive elements.'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
