import { Translations } from '@koobiq/docs-examples/i18n';

/** Text shown by the breadcrumbs examples. Acronyms (RBAC, ABAC, AES) and hashes stay as-is. */
export interface ExampleTranslation {
    informationSecurity: string;
    accessControl: string;
    authorization: string;
    roles: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        informationSecurity: 'Информационная безопасность',
        accessControl: 'Контроль доступа',
        authorization: 'Авторизация',
        roles: 'Роли'
    },
    default: {
        informationSecurity: 'Information Security',
        accessControl: 'Access Control',
        authorization: 'Authorization',
        roles: 'Roles'
    }
};
