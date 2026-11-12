import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the sidebar-with-splitter example. */
export interface ExampleText {
    openedContent: string;
    closedContent: string;
    mainContent: string;
    toggle: string;
    toggleModel: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        openedContent: 'Содержимое (открыто)',
        closedContent: 'Содержимое (закрыто)',
        mainContent: 'Основное содержимое',
        toggle: 'Переключить',
        toggleModel: 'Переключить модель'
    },
    default: {
        openedContent: 'Opened content',
        closedContent: 'Closed content',
        mainContent: 'Main content',
        toggle: 'Toggle',
        toggleModel: 'Toggle model'
    }
};
