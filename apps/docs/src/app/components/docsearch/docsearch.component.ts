import { ChangeDetectionStrategy, Component } from '@angular/core';

import docsearch from '@docsearch/js';
import * as UAParser from 'ua-parser-js';

@Component({
    standalone: true,
    selector: 'docs-docsearch',
    template: '',
    styleUrl: './docsearch.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsearchComponent {
    private readonly uaParser = new UAParser();

    constructor() {
        this.initDocSearch();
    }

    private initDocSearch(): void {
        const osName = this.uaParser.getOS().name;
        let buttonText = 'Поиск';
        if (osName.includes('Win')) {
            buttonText += ' Ctrl+K';
        }
        if (osName.includes('Mac')) {
            buttonText += ' ⌘K';
        }
        let transformItems;
        // transform URL to work docsearch on DEV stand
        if (location.host !== 'koobiq.io' || location.protocol !== 'https:') {
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
            maxResultsPerGroup: 20,
            transformItems,
            searchParameters: {
                hitsPerPage: 40,
            },
            disableUserPersonalization: false,
            resultsFooterComponent: null,
            placeholder: 'Поиск',
            translations: {
                button: {
                    buttonText,
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
                        selectText: 'Выбрать',
                        selectKeyAriaLabel: 'Клавиша Enter',
                        navigateText: 'Вниз (вверх)',
                        navigateUpKeyAriaLabel: 'Клавиша стрелка вверх',
                        navigateDownKeyAriaLabel: 'Клавиша стрелка вниз',
                        closeText: 'Закрыть',
                        closeKeyAriaLabel: 'Клавиша Escape',
                        searchByText: 'Поиск'
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
