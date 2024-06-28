import { ChangeDetectionStrategy, Component } from '@angular/core';

import docsearch from '@docsearch/js';

@Component({
    standalone: true,
    selector: 'docs-docsearch',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsearchComponent {
    constructor() {
        this.initDocSearch();
    }

    private initDocSearch(): void {
        let transformItems;
        if (location.host !== 'koobiq.io' && location.protocol !== 'https:') {
            transformItems = (items) => {
                return items.map((item) => {
                    item.url = item.url.replace('koobiq.io', location.host);
                    item.url = item.url.replace('https:', location.protocol);
                    return item;
                });
            };
        }
        /** @see https://docsearch.algolia.com/docs/api */
        docsearch({
            container: 'docs-docsearch',
            appId: '7N2W9AKEM6',
            apiKey: '0f0df042e7b349df5cb381e72f268b4d',
            indexName: 'koobiq',
            maxResultsPerGroup: 99,
            transformItems,
            placeholder: 'Поиск',
            translations: {
                button: {
                    buttonText: 'Поиск',
                    buttonAriaLabel: 'Поиск'
                },
                modal: {
                    searchBox: {
                        resetButtonTitle: 'Очистить запрос',
                        resetButtonAriaLabel: 'Очистить запрос',
                        cancelButtonText: 'Отмена',
                        cancelButtonAriaLabel: 'Отмена',
                        searchInputLabel: 'Поиск'
                    },
                    startScreen: {
                        recentSearchesTitle: 'Недавние',
                        noRecentSearchesText: 'Нет недавних поисков',
                        saveRecentSearchButtonTitle: 'Сохранить этот поиск',
                        removeRecentSearchButtonTitle: 'Удалить этот поиск из истории',
                        favoriteSearchesTitle: 'Избранное',
                        removeFavoriteSearchButtonTitle: 'Удалить этот поиск из избранного'
                    },
                    errorScreen: {
                        titleText: 'Не удалось получить результаты',
                        helpText: 'Возможно, вам следует проверить соединение с интернетом.'
                    },
                    footer: {
                        selectText: 'для выбора',
                        selectKeyAriaLabel: 'Клавиша Enter',
                        navigateText: 'для навигации',
                        navigateUpKeyAriaLabel: 'Стрелка вверх',
                        navigateDownKeyAriaLabel: 'Стрелка вниз',
                        closeText: 'для закрытия',
                        closeKeyAriaLabel: 'Клавиша Escape',
                        searchByText: 'Поиск по'
                    },
                    noResultsScreen: {
                        noResultsText: 'Нет результатов для',
                        suggestedQueryText: 'Попробуйте поискать',
                        reportMissingResultsText: 'Считаете, что этот запрос должен вернуть результаты?',
                        reportMissingResultsLinkText: 'Сообщите нам.'
                    }
                }
            }
        });
    }
}
