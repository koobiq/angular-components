import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the autocomplete examples. */
export interface ExampleText {
    try: string;
    or: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        try: 'Попробуйте',
        or: 'или'
    },
    default: {
        try: 'Try',
        or: 'or'
    }
};
