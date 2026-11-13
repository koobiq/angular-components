import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the sidebar-overview example. */
export interface ExampleTranslation {
    leftOpenedContent: string;
    leftClosedContent: string;
    rightOpenedContent: string;
    mainContent: string;
    rightClosedContent: string;
    toggleLeftModel: string;
    toggleLeft: string;
    toggleRightModel: string;
    toggleRight: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        leftOpenedContent: 'Содержимое левой панели (открыта)',
        leftClosedContent: 'Содержимое левой панели (закрыта)',
        rightOpenedContent: 'Содержимое правой панели (открыта)',
        mainContent: 'Основное содержимое',
        rightClosedContent: 'Содержимое правой панели (закрыта)',
        toggleLeftModel: 'Переключить левую модель',
        toggleLeft: 'Переключить левую',
        toggleRightModel: 'Переключить правую модель',
        toggleRight: 'Переключить правую'
    },
    default: {
        leftOpenedContent: 'Left opened content',
        leftClosedContent: 'Left closed content',
        rightOpenedContent: 'Right opened content',
        mainContent: 'Main content',
        rightClosedContent: 'Right closed content',
        toggleLeftModel: 'Toggle left model',
        toggleLeft: 'Toggle left',
        toggleRightModel: 'Toggle right model',
        toggleRight: 'Toggle right'
    }
};
