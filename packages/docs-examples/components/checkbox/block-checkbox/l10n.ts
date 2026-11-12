import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the checkbox examples. */
export interface ExampleText {
    title: string;
    loremIpsum: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        title: 'Заголовок',
        loremIpsum: 'Lorem ipsum'
    },
    default: {
        title: 'Title',
        loremIpsum: 'Lorem ipsum'
    }
};
