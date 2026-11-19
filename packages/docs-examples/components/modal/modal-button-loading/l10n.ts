import type { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the modal-button-loading example. */
export interface ExampleTranslation {
    open: string;
    title: string;
    content: string;
    save: string;
    cancel: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        open: 'Открыть модальное окно',
        title: 'Сохранение изменений',
        content: 'Кнопка «Сохранить» выполняет запрос и показывает состояние загрузки, пока запрос не завершится.',
        save: 'Сохранить',
        cancel: 'Отмена'
    },
    default: {
        open: 'Open modal',
        title: 'Saving changes',
        content: 'The Save button performs a request and shows its loading state until the request settles.',
        save: 'Save',
        cancel: 'Cancel'
    }
};
