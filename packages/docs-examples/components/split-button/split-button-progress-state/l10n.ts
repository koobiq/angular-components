import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the split-button-progress-state example. */
export interface ExampleTranslation {
    splitButton: string;
    moreOptions: string;
    primaryProgress: string;
    secondaryProgress: string;
    completelyProgress: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        splitButton: 'Кнопка с меню',
        moreOptions: 'Другие параметры',
        primaryProgress: 'Основная в процессе',
        secondaryProgress: 'Вторичная в процессе',
        completelyProgress: 'Полностью в процессе'
    },
    default: {
        splitButton: 'Split Button',
        moreOptions: 'More options',
        primaryProgress: 'Primary in Progress',
        secondaryProgress: 'Secondary in Progress',
        completelyProgress: 'Completely in Progress'
    }
};
