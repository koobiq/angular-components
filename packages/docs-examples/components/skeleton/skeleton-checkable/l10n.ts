import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the skeleton examples. Domain names, product names (LDAP) and logins stay as-is. */
export interface ExampleTranslation {
    loading: string;
    syncHint: string;
    notifyHint: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        loading: 'Загрузка',
        syncHint: 'Следующая синхронизация начнётся в 12:00',
        notifyHint: 'По почте и в центре уведомлений'
    },
    default: {
        loading: 'Loading',
        syncHint: 'The next synchronization starts at 12:00',
        notifyHint: 'By email and in the notification center'
    }
};
