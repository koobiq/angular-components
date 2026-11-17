import { Translations } from '@koobiq/docs-examples/i18n';

/** Text of the example-top-bar-breadcrumbs component. */
export interface ExampleTranslation {
    details: string;
    filter: string;
    share: string;
    breadcrumbShortening: string;
    leftmostHidden: string;
    currentItemTruncation: string;
    rightSideCompression: string;
}

export const TRANSLATIONS: Translations<ExampleTranslation> = {
    'ru-RU': {
        details: 'Детали',
        filter: 'Фильтр',
        share: 'Поделиться',
        breadcrumbShortening:
            'За основу берется автоматическое сокращение хлебных крошек, когда средние пункты скрываются при отсутствии свободного пространства.',
        leftmostHidden:
            'Если пространство становится еще уже, то скрывается и левый крайний уровень у хлебных крошек, оставляя видимым только крайний правый уровень.',
        currentItemTruncation:
            'Минимальная ширина левой стороны зависит от заголовка текущего пункта, который может быть обрезан до 3 символов с добавлением трех точек (…).',
        rightSideCompression:
            'После достижения минимальной ширины у левой стороны можно приступить к сжатию правой стороны с действиями. '
    },
    default: {
        details: 'Details',
        filter: 'Filter',
        share: 'Share',
        breadcrumbShortening:
            'The automatic breadcrumb shortening is used as the basis, where middle items are hidden when there is not enough free space.',
        leftmostHidden:
            'If the space becomes even narrower, the leftmost breadcrumb level is also hidden, leaving only the rightmost level visible.',
        currentItemTruncation:
            'The minimum width of the left side depends on the title of the current item, which can be truncated to 3 characters with an ellipsis (…).',
        rightSideCompression:
            'After reaching the minimum width on the left side, the compression of the right side with actions can begin.'
    }
};
