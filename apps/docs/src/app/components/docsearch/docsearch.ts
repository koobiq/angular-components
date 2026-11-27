// The Algolia crawler that fills the index reads the records of a page by attributes, one per level of the
// `recordProps` of `helpers.docsearch()`: the markup says what a record is made of, so restyling a page leaves the
// search alone.
// - `data-docsearch-lvl0`: the group of the page in the results, the value of the one element of the page with it;
// - `data-docsearch-lvl1`: the title of the page, the text of the one element that has it;
// - `data-docsearch-lvl2`: a heading of a section;
// - `data-docsearch-content`: a paragraph of the text.
// Every record also gets the `lang` facet the search filters by, which `helpers.docsearch()` takes from `<html lang>`.
//
// The crawler's configuration lives in the Algolia dashboard (crawler `koobiq`, Editor: `actions`) rather than in this
// repository and selects these attributes, so renaming one has to be made there too. The pages set them in the
// templates of the viewers and of the API tab, and in the headings and paragraphs `tools/docs-pages/compile-page.ts`
// renders. The crawl does not fail on a page that lost them, it only drops the page from the search.

import { afterNextRender, DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import docsearch, { type DocSearchInstance, type DocSearchProps } from '@docsearch/js/docsearch';
import { combineLatest, distinctUntilChanged, map } from 'rxjs';
import { KBQ_WINDOW, KbqThemeService } from '@koobiq/components/core';
import { DocsLocale } from '../../constants/locale';
import { DocsLocaleState } from '../../services/locale';
import { DOCS_SITE_ORIGIN } from '../../site-origin';

const INDEX_NAME = new URL(DOCS_SITE_ORIGIN).hostname === 'next.koobiq.io' ? 'koobiq-next' : 'koobiq';

const SELECTOR = 'docs-docsearch';

type DocSearchTranslations = NonNullable<DocSearchProps['translations']>;

const TRANSLATION_RU: DocSearchTranslations = {
    button: {
        buttonText: 'Поиск',
        buttonAriaLabel: 'Поиск'
    },
    modal: {
        searchBox: {
            clearButtonTitle: 'Очистить запрос',
            clearButtonAriaLabel: 'Очистить запрос',
            closeButtonText: 'Отмена',
            closeButtonAriaLabel: 'Отмена',
            placeholderText: 'Поиск по документации',
            enterKeyHint: 'Enter',
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
            poweredByText: 'Работает на'
        },
        facets: {
            defaultValueLabel: 'Все',
            facetMenuTriggerAriaLabel: 'выбрано',
            clearAllLabel: 'Очистить все',
            facetsAriaLabel: 'Фильтры поиска',
            selectedFacetsAriaLabel: 'Выбранные фильтры поиска',
            clearFacetAriaLabel: 'Очистить фильтр:'
        },
        noResultsScreen: {
            noResultsText: 'Нет результатов для',
            suggestedQueryText: 'Попробуйте поискать',
            reportMissingResultsText: 'Считаете, что этот запрос должен вернуть результаты?',
            reportMissingResultsLinkText: 'Сообщите нам.'
        },
        resultsScreen: {
            resultsSectionTitle: 'Результаты поиска',
            resultBadgeLabelText: 'Категория'
        }
    }
};

const TRANSLATIONS: Record<DocsLocale, DocSearchTranslations> = {
    [DocsLocale.Ru]: TRANSLATION_RU,
    [DocsLocale.En]: { modal: { searchBox: { placeholderText: 'Search the docs' } } }
};

/** Algolia DocSearch component implementation */
@Directive({
    selector: SELECTOR,
    host: {
        class: 'layout-align-center-center'
    }
})
export class DocsDocsearch extends DocsLocaleState {
    private readonly window = inject(KBQ_WINDOW);
    private readonly destroyRef = inject(DestroyRef);
    private readonly theme = inject(KbqThemeService);

    // captured eagerly (in the constructor's injection context), since `toObservable()` can't be
    // called lazily from the `afterNextRender()` callback in `init()`
    private readonly colorScheme$ = toObservable(this.theme.colorScheme);
    private instance: DocSearchInstance | null = null;

    constructor() {
        super();

        afterNextRender(() => {
            this.init();
        });

        this.destroyRef.onDestroy(() => {
            this.instance?.destroy();
            this.instance = null;
        });
    }

    private init(): void {
        combineLatest([
            this.colorScheme$.pipe(
                map((colorScheme) => colorScheme satisfies DocSearchProps['theme']),
                distinctUntilChanged()
            ),
            this.docsLocaleService.changes.pipe(distinctUntilChanged())
        ])
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(([theme, locale]) => {
                // docsearch() re-renders into the same container on every call (no full teardown),
                // so calling it again just updates theme/locale in place; destroying first would
                // unmount the modal (losing scroll/open state) and cause a visible flicker.
                this.instance = docsearch({
                    container: SELECTOR,
                    appId: '7N2W9AKEM6',
                    apiKey: '0f0df042e7b349df5cb381e72f268b4d',
                    maxResultsPerGroup: 20,
                    theme,
                    indices: [
                        { name: INDEX_NAME, searchParameters: { hitsPerPage: 40, facetFilters: [`lang:${locale}`] } }
                    ],
                    transformItems: this.transformItems,
                    translations: TRANSLATIONS[locale]
                });
            });
    }

    private readonly transformItems: DocSearchProps['transformItems'] = (items) => {
        const previewOrigin = this.window.location.origin;

        if (previewOrigin !== DOCS_SITE_ORIGIN) {
            items = items.map((item) => {
                const url = new URL(item.url);

                return url.origin === DOCS_SITE_ORIGIN
                    ? { ...item, url: previewOrigin + url.pathname + url.search + url.hash }
                    : item;
            });
        }

        return items.filter((item) => {
            // should hide hit, whose 'lvl2' header doesn't match with search query
            if (item.type === 'lvl2') {
                const { matchLevel } =
                    item._highlightResult?.hierarchy.lvl2 || item._snippetResult?.hierarchy.lvl2 || {};

                return !(item.content === null && matchLevel === 'none');
            }

            return item;
        });
    };
}
