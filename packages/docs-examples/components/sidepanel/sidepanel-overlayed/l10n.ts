import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the sidepanel-overlayed example. */
export interface ExampleText {
    close: string;
    open: string;
    position: string;
    templateContent: string;
    templateBody: string;
    openAnother: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        close: 'Закрыть',
        open: 'Открыть',
        position: 'Позиция',
        templateContent: 'Содержимое шаблона панели',
        templateBody: 'Тело шаблона панели',
        openAnother: 'Открыть другую панель'
    },
    default: {
        close: 'Close',
        open: 'Open',
        position: 'Position',
        templateContent: 'Sidepanel Template Content',
        templateBody: 'Sidepanel Template Body',
        openAnother: 'Open another sidepanel'
    }
};
