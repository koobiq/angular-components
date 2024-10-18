import { afterNextRender, ChangeDetectionStrategy, Component } from '@angular/core';
import docsearch from '@docsearch/js';
import { UAParser } from 'ua-parser-js';

type _DocSearchProps = Parameters<typeof docsearch>[0];

const DOCSEARCH_COMPONENT_SELECTOR = 'docs-docsearch';
const HOST = 'koobiq.io';
const PROTOCOL = 'https:';

/** Algolia DocSearch component implementation */
@Component({
    standalone: true,
    selector: DOCSEARCH_COMPONENT_SELECTOR,
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsearchComponent {
    private readonly DOCSEARCH_CONFIG: _DocSearchProps = {
        container: DOCSEARCH_COMPONENT_SELECTOR,
        appId: '7N2W9AKEM6',
        apiKey: '0f0df042e7b349df5cb381e72f268b4d',
        indexName: 'koobiq',
        maxResultsPerGroup: 20,
        searchParameters: {
            hitsPerPage: 40
        },
        disableUserPersonalization: false,
        resultsFooterComponent: () => null,
        placeholder: 'Поиск'
    };

    /** should transform item URL to work docsearch on DEV stand */
    private readonly shouldTransformItemURL = location.host !== HOST || location.protocol !== PROTOCOL;

    constructor() {
        afterNextRender(() => {
            this.initDocsearch();
        });
    }

    private initDocsearch(): void {
        docsearch({
            ...this.DOCSEARCH_CONFIG,
            transformItems: this.transformItems,
            translations: this.translations()
        });
    }

    private readonly transformItems: _DocSearchProps['transformItems'] = (items) => {
        if (this.shouldTransformItemURL) {
            items = items.map((item) => {
                item.url = item.url.replace(HOST, location.host);
                item.url = item.url.replace(PROTOCOL, location.protocol);
                return item;
            });
        }
        return items.filter((item) => {
            /** should hide hit, whose 'lvl2' header doesn't match with search query */
            if (item.type === 'lvl2') {
                const { matchLevel } =
                    item._highlightResult?.hierarchy.lvl2 || item._snippetResult?.hierarchy.lvl2 || {};
                return !(item.content === null && matchLevel === 'none');
            }
            return item;
        });
    };

    private readonly translations = (): _DocSearchProps['translations'] => {
        const uaParser = new UAParser();
        const osName = uaParser.getOS().name || '';
        let buttonText = 'Поиск';
        if (osName.includes('Win')) {
            buttonText += ' Ctrl+K';
        }
        if (osName.includes('Mac')) {
            buttonText += ' ⌘K';
        }
        return {
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
        };
    };
}
