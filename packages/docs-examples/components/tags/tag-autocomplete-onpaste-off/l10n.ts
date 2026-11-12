import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text of the onpaste-off example. */
export interface ExampleText {
    createTag: string;
    notFound: string;
    newTag: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        createTag: 'Создать: ',
        notFound: 'Ничего не найдено',
        newTag: 'Новый тег'
    },
    default: {
        createTag: 'Create: ',
        notFound: 'Nothing found',
        newTag: 'New tag'
    }
};
