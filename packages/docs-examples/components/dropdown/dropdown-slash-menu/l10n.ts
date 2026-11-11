import { Signal } from '@angular/core';
import { injectLocalizedText } from '../l10n';

/** One block of the slash menu. */
export interface ExampleBlock {
    name: string;
    icon: string;
}

/** Editor and menu groups of the slash-menu example. */
export interface ExampleText {
    editorLabel: string;
    nothingFound: string;
    closeMenu: string;
    editorText: string;
    groups: { label: string; items: ExampleBlock[] }[];
}

const TEXT: Record<string, ExampleText> & { default: ExampleText } = {
    'ru-RU': {
        editorLabel: 'Текст статьи',
        nothingFound: 'Ничего не найдено',
        closeMenu: 'Закрыть меню',
        editorText: 'Введите / в любом месте этого текста, чтобы открыть меню блоков.',
        groups: [
            {
                label: 'Предложенные',
                items: [
                    { name: 'Текст', icon: 'kbq-paragraph-sign_16' },
                    { name: 'Маркированный список', icon: 'kbq-list-ul_16' },
                    { name: 'Список задач', icon: 'kbq-checkbox-multiple_16' }
                ]
            },
            {
                label: 'Базовые блоки',
                items: [
                    { name: 'Нумерованный список', icon: 'kbq-list-ol_16' },
                    { name: 'Код', icon: 'kbq-code_16' },
                    { name: 'Таблица', icon: 'kbq-table_16' },
                    { name: 'Изображение', icon: 'kbq-image_16' },
                    { name: 'Разделитель', icon: 'kbq-minus_16' }
                ]
            }
        ]
    },
    default: {
        editorLabel: 'Article text',
        nothingFound: 'Nothing found',
        closeMenu: 'Close menu',
        editorText: 'Type / anywhere in this text to open the block menu.',
        groups: [
            {
                label: 'Suggested',
                items: [
                    { name: 'Text', icon: 'kbq-paragraph-sign_16' },
                    { name: 'Bulleted list', icon: 'kbq-list-ul_16' },
                    { name: 'To-do list', icon: 'kbq-checkbox-multiple_16' }
                ]
            },
            {
                label: 'Basic blocks',
                items: [
                    { name: 'Numbered list', icon: 'kbq-list-ol_16' },
                    { name: 'Code', icon: 'kbq-code_16' },
                    { name: 'Table', icon: 'kbq-table_16' },
                    { name: 'Image', icon: 'kbq-image_16' },
                    { name: 'Divider', icon: 'kbq-minus_16' }
                ]
            }
        ]
    }
};

/** Text of the example in the active locale. */
export const injectExampleText = (): Signal<ExampleText> => injectLocalizedText(TEXT);
