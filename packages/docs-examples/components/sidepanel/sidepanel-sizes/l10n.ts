import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the sidepanel examples. Position and size names (Right, Small) stay English as API values. */
export interface ExampleText {
    templateContent: string;
    templateBody: string;
    button: string;
    action: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        templateContent: 'Содержимое шаблона панели',
        templateBody: 'Тело шаблона панели',
        button: 'Кнопка',
        action: 'Действие'
    },
    default: {
        templateContent: 'Sidepanel Template Content',
        templateBody: 'Sidepanel Template Body',
        button: 'Button',
        action: 'Action'
    }
};
