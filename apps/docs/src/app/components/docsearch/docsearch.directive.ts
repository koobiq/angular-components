import { afterNextRender, DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import docsearch from '@docsearch/js';
import { isMac } from '@koobiq/components/core';
import { DocsLocaleState, isRuLocale } from '../../services/locale';

type _DocSearchProps = Parameters<typeof docsearch>[0];

const SELECTOR = 'docs-docsearch';

const HOST = 'koobiq.io';

const PROTOCOL = 'https:';

const CONFIG: _DocSearchProps = {
    container: SELECTOR,
    appId: '7N2W9AKEM6',
    apiKey: '0f0df042e7b349df5cb381e72f268b4d',
    indexName: 'koobiq',
    maxResultsPerGroup: 20,
    disableUserPersonalization: false,
    resultsFooterComponent: () => null
} as const;

/** Algolia DocSearch component implementation */
@Directive({
    standalone: true,
    selector: SELECTOR,
    host: {
        class: 'layout-align-center-center'
    }
})
export class DocsearchDirective extends DocsLocaleState {
    /** should transform item URL to work docsearch on DEV stand */
    private readonly shouldTransformItemURL = location.host !== HOST || location.protocol !== PROTOCOL;

    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        super();

        afterNextRender(() => {
            this.initDocsearch();
        });
    }

    private initDocsearch(): void {
        this.docsLocaleService.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((locale) => {
            const _isRuLocale = isRuLocale(locale);
            docsearch({
                ...CONFIG,
                searchParameters: {
                    hitsPerPage: 40,
                    facetFilters: [`lang:${locale}`]
                },
                placeholder: _isRuLocale ? 'Поиск' : 'Search',
                transformItems: this.transformItems,
                translations: this.translations(_isRuLocale)
            });
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

    private readonly translations = (isRuLocale: boolean): _DocSearchProps['translations'] => {
        let buttonText = isRuLocale ? 'Поиск' : 'Search';

        buttonText += isMac() ? ' ⌘K' : ' Ctrl+K';

        return isRuLocale
            ? {
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
            : {
                  button: {
                      buttonText
                  }
              };
    };
}
