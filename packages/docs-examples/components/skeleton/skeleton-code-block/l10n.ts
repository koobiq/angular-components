import { LocalizedText } from '@koobiq/docs-examples/i18n';

/** Text shown by the skeleton examples. Domain names, product names (LDAP) and logins stay as-is. */
export interface ExampleText {
    loading: string;
}

export const TEXT: LocalizedText<ExampleText> = {
    'ru-RU': {
        loading: 'Загрузка'
    },
    default: {
        loading: 'Loading'
    }
};
