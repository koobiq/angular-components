import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the dropdown-overview example. */
export interface ExampleTranslation {
    textNormal: string;
    caption: string;
    header: string;
    disabled: string;
    point2: string;
    point3: string;
    link: string;
    loadingItem: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        textNormal: 'Обычный текст',
        caption: 'Подпись',
        header: 'Заголовок',
        disabled: 'Отключено',
        point2: 'Пункт 2',
        point3: 'Пункт 3',
        link: 'Ссылка',
        loadingItem: 'Загрузка пункта'
    },
    default: {
        textNormal: 'Text Normal',
        caption: 'Caption',
        header: 'Header',
        disabled: 'Disabled',
        point2: 'Point 2',
        point3: 'Point 3',
        link: 'Link',
        loadingItem: 'Loading item'
    }
};
