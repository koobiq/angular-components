import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the split-button examples. Style names (Filled Contrast) stay English as API names. */
export interface ExampleText {
    splitButton: string;
    moreOptions: string;
    primaryDisabled: string;
    secondaryDisabled: string;
    completelyDisabled: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        splitButton: 'Кнопка с меню',
        moreOptions: 'Другие параметры',
        primaryDisabled: 'Основная отключена',
        secondaryDisabled: 'Вторичная отключена',
        completelyDisabled: 'Полностью отключена'
    },
    default: {
        splitButton: 'Split Button',
        moreOptions: 'More options',
        primaryDisabled: 'Primary Disabled',
        secondaryDisabled: 'Secondary Disabled',
        completelyDisabled: 'Completely Disabled'
    }
};
