import type { Translations } from '@koobiq/docs-examples/i18n';

export interface ExampleTranslation {
    limit: string;
    hint: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    default: {
        limit: 'Запросов в секунду',
        hint: 'Сверх лимита запросы встают в очередь и обрабатываются, когда нагрузка спадёт.'
    },
    'en-US': {
        limit: 'Requests per second',
        hint: 'Requests above the limit are queued until the load drops.'
    }
};
