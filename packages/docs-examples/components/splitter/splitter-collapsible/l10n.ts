import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the splitter examples. Constraint hints (min, snap) stay English as CSS mechanics. */
export interface ExampleText {
    sidebarCollapsed: string;
    terminalCollapsed: string;
    dragLeftToCollapse: string;
    dragBottomToCollapse: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        sidebarCollapsed: 'Панель свёрнута',
        terminalCollapsed: 'Терминал свёрнут',
        dragLeftToCollapse: 'Перетащите влево, чтобы свернуть',
        dragBottomToCollapse: 'Перетащите вниз, чтобы свернуть'
    },
    default: {
        sidebarCollapsed: 'Sidebar collapsed',
        terminalCollapsed: 'Terminal collapsed',
        dragLeftToCollapse: 'Drag left to collapse',
        dragBottomToCollapse: 'Drag bottom to collapse'
    }
};
