import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';

import * as UAParser from 'ua-parser-js';

@Component({
    standalone: true,
    selector: 'docs-docsearch',
    template: '',
    styleUrl: './docsearch.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsearchComponent implements OnInit {
    private readonly platform = inject(PLATFORM_ID);

    private readonly DOCSEARCH_CONTAINER = 'docs-docsearch';
    private readonly DOCSEARCH_CONFIG = {
        appId: '7N2W9AKEM6',
        apiKey: '0f0df042e7b349df5cb381e72f268b4d',
        indexName: 'koobiq',
        maxResultsPerGroup: 20,
        searchParameters: {
            hitsPerPage: 40,
        },
        disableUserPersonalization: false,
        resultsFooterComponent: null,
        placeholder: 'Поиск',
    };

    async ngOnInit() {
        if (isPlatformBrowser(this.platform)) {
            const uaParser = new UAParser();
            const { default: docsearch } = await import('@docsearch/js');

            const osName = uaParser.getOS().name;
            // should transform item URL to work docsearch on DEV stand
            const shouldTransformItemURL = location.host !== 'koobiq.io' || location.protocol !== 'https:';
            let buttonText = 'Поиск';
            if (osName.includes('Win')) {
                buttonText += ' Ctrl+K';
            }
            if (osName.includes('Mac')) {
                buttonText += ' ⌘K';
            }
            /** @see https://docsearch.algolia.com/docs/api */
            docsearch({
                ...this.DOCSEARCH_CONFIG,
                container: this.DOCSEARCH_CONTAINER,
                transformItems: (items: any[]) => this.transformItems(items, shouldTransformItemURL),
                translations: this.getTranslations(buttonText),
            });
        }
    }

    private transformItems(items: any[], shouldTransformItemURL: boolean): any[] {
        if (shouldTransformItemURL) {
            items = items.map((item) => {
                item.url = item.url.replace('koobiq.io', location.host);
                item.url = item.url.replace('https:', location.protocol);
                return item;
            });
        }
        return items.filter((item) => {
            return !(
                item.type === 'lvl2' &&
                item.content === null &&
                item._highlightResult.hierarchy.lvl2.matchLevel === 'none'
            );
        });
    }

    private getTranslations(buttonText: string) {
        return {
            button: {
                buttonText,
                buttonAriaLabel: 'Поиск',
            },
            modal: {
                searchBox: {
                    resetButtonTitle: 'Очистить запрос',
                    resetButtonAriaLabel: 'Очистить запрос',
                    cancelButtonText: 'Отмена',
                    cancelButtonAriaLabel: 'Отмена',
                    searchInputLabel: 'Поиск',
                },
                startScreen: {
                    recentSearchesTitle: 'Недавние',
                    noRecentSearchesText: 'Нет недавних поисков',
                    saveRecentSearchButtonTitle: 'Сохранить этот поиск',
                    removeRecentSearchButtonTitle: 'Удалить этот поиск из истории',
                    favoriteSearchesTitle: 'Избранное',
                    removeFavoriteSearchButtonTitle: 'Удалить этот поиск из избранного',
                },
                errorScreen: {
                    titleText: 'Не удалось получить результаты',
                    helpText: 'Возможно, вам следует проверить соединение с интернетом.',
                },
                footer: {
                    selectText: 'Выбрать',
                    selectKeyAriaLabel: 'Клавиша Enter',
                    navigateText: 'Вниз (вверх)',
                    navigateUpKeyAriaLabel: 'Клавиша стрелка вверх',
                    navigateDownKeyAriaLabel: 'Клавиша стрелка вниз',
                    closeText: 'Закрыть',
                    closeKeyAriaLabel: 'Клавиша Escape',
                    searchByText: 'Поиск',
                },
                noResultsScreen: {
                    noResultsText: 'Нет результатов для',
                    suggestedQueryText: 'Попробуйте поискать',
                    reportMissingResultsText: 'Считаете, что этот запрос должен вернуть результаты?',
                    reportMissingResultsLinkText: 'Сообщите нам.',
                },
            },
        };
    }
}
