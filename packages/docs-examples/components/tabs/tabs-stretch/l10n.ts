import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the tabs examples. OS names (macOS, Windows) stay as proper names. */
export interface ExampleText {
    bruteforce: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        bruteforce: 'Подбор пароля'
    },
    default: {
        bruteforce: 'BruteForce'
    }
};
