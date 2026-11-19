import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    threshold: string;
    quietHours: string;
    balance: string;
    left: string;
    right: string;
    thermal: string;
    bounds: string[];
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        threshold: 'Минимальная зарплата',
        quietHours: 'Не беспокоить',
        balance: 'Баланс звука',
        left: 'Слева',
        right: 'Справа',
        thermal: 'Относительно нормы 20 градусов',
        bounds: ['Конец тихих часов', 'Начало тихих часов']
    },
    'en-US': {
        threshold: 'Minimum salary',
        quietHours: 'Do not disturb',
        balance: 'Audio balance',
        left: 'Left',
        right: 'Right',
        thermal: 'Relative to the 20 °C baseline',
        bounds: ['End of quiet hours', 'Start of quiet hours']
    }
};
