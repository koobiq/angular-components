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
    withArrow: string;
    toggle: string;
    itemLocked: string;
    confidence: string;
    incidentType: string;
    detected: string;
    updated: string;
    extendedTypes: string[];
    action: (index: number) => string;
    diamond: string;
    buttonWithTooltip: string;
    default: string;
    defaultWithArrow: string;
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
        withArrow: 'Со стрелкой',
        toggle: 'переключить',
        itemLocked: 'Этот объект заблокирован и не может быть удалён',
        confidence: 'Уверенность',
        incidentType: 'Тип инцидента',
        detected: 'Обнаружен',
        updated: 'Обновлён',
        extendedTypes: [
            'Заражение вредоносным ПО',
            'Фишинговая атака',
            'Утечка данных',
            'Атака DoS/DDoS'
        ],
        action: (index) => `Действие ${index}`,
        diamond: 'Ромб',
        buttonWithTooltip: 'Кнопка с тултипом',
        default: 'По умолчанию',
        defaultWithArrow: 'По умолчанию со стрелкой',
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
        withArrow: 'With arrow',
        toggle: 'toggle',
        itemLocked: 'This item is locked and cannot be deleted',
        confidence: 'Confidence',
        incidentType: 'Incident Type',
        detected: 'Detected',
        updated: 'Updated',
        extendedTypes: ['Malware Infection', 'Phishing Attack', 'Data Breach', 'DoS/DDoS Attack'],
        action: (index) => `Action${index}`,
        diamond: 'Diamond',
        buttonWithTooltip: 'Button with a tooltip',
        default: 'Default',
        defaultWithArrow: 'Default with arrow',
        add: 'Add',
        create: 'Create',
        longTooltip:
            'A tooltip is a hint that appears when the pointer hovers over or focuses on an interface element. A tooltip cannot contain interactive elements.'
    }
};

/** Text of the examples in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
