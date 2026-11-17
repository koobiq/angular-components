import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the sidepanel-normal-mode example. */
export interface ExampleTranslation {
    position: string;
    templateContent: string;
    templateBody: string;
    button: string;
    action: string;
    closeSidepanel: string;
    openSidepanel: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        position: 'Позиция',
        templateContent: 'Содержимое шаблона панели',
        templateBody: 'Тело шаблона панели',
        button: 'Кнопка',
        action: 'Действие',
        closeSidepanel: 'Закрыть панель',
        openSidepanel: 'Открыть панель'
    },
    default: {
        position: 'Position',
        templateContent: 'Sidepanel Template Content',
        templateBody: 'Sidepanel Template Body',
        button: 'Button',
        action: 'Action',
        closeSidepanel: 'Close sidepanel',
        openSidepanel: 'Open sidepanel'
    }
};
