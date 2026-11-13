import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the example-top-bar component. */
export interface ExampleTranslation {
    pageHeader: string;
    fullDisplay: string;
    truncatedTitle: string;
    compressRight: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        pageHeader: 'Заголовок страницы',
        fullDisplay: 'Когда есть свободное пространство заголовок и действия отображаются полностью',
        truncatedTitle:
            'Минимальная ширина левой стороны зависит от заголовка страницы, который может быть обрезан до 3 символов с добавлением трех точек (…).',
        compressRight:
            'После достижения минимальной ширины у левой стороны можно приступить к сжатию правой стороны с действиями. '
    },
    default: {
        pageHeader: 'Page Header',
        fullDisplay: 'When there is free space, the title and actions are fully displayed.',
        truncatedTitle:
            'The minimum width of the left side depends on the page title, which can be truncated to 3 characters with the addition of three dots (…).',
        compressRight:
            'After reaching the minimum width on the left side, you can start compressing the right side with the actions.'
    }
};
