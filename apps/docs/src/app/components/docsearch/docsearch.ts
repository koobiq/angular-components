import { afterNextRender, DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import docsearch, { DocSearchInstance, DocSearchProps } from '@docsearch/js/docsearch';
import { KBQ_WINDOW, KbqThemeService } from '@koobiq/components/core';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { DocsLocale } from '../../constants/locale';
import { DocsLocaleState } from '../../services/locale';

/** The index the crawler writes and the search reads. */
const INDEX_NAME = 'koobiq';

/**
 * The attributes the Algolia crawler that fills the search index reads the records of a page by, one per level of the
 * `recordProps` of `helpers.docsearch()`: the markup says what a record is made of, so restyling a page leaves the
 * search alone. Every record also gets the `lang` facet the search filters by, which `helpers.docsearch()` takes
 * from `<html lang>`.
 *
 * The crawler's configuration lives in the Algolia dashboard (crawler `koobiq`, Editor: `actions`) rather than in this
 * repository and selects these attributes, so renaming one has to be made there too. The pages set them in the
 * templates of the viewers and of the API tab, and in the headings and paragraphs `tools/docs-pages/compile-page.ts`
 * renders. The crawl does not fail on a page that lost them, it only drops the page from the search: the docs smoke
 * suite (`apps/docs/e2e.playwright-spec.ts`) checks them instead, with a copy of these names, since importing this
 * file would load Angular into it.
 */
export const DOCS_SEARCH_RECORD = {
    /** The group of the page in the results, as the value of the one element of the page that has it. */
    lvl0: 'data-docsearch-lvl0',
    /** The title of the page: the text of the one element that has it. */
    lvl1: 'data-docsearch-lvl1',
    /** A heading of a section. */
    lvl2: 'data-docsearch-lvl2',
    /** A paragraph of the text. */
    content: 'data-docsearch-content'
} as const;

const SELECTOR = 'docs-docsearch';
const HOST = 'koobiq.io';
const PROTOCOL = 'https:';

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
            placeholderText: 'Поиск по документации на koobiq.io',
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

// The placeholder names koobiq.io: the index holds its pages alone, whichever site of a version the search is opened on.
const TRANSLATIONS: Record<DocsLocale, DocSearchTranslations> = {
    [DocsLocale.Ru]: TRANSLATION_RU,
    [DocsLocale.En]: { modal: { searchBox: { placeholderText: 'Search the docs on koobiq.io' } } }
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
        // should transform item URL to work docsearch on DEV stand (firebase preview)
        const shouldTransformItemURL = this.window.location.host !== HOST || this.window.location.protocol !== PROTOCOL;

        if (shouldTransformItemURL) {
            items = items.map((item) => {
                item.url = item.url.replace(HOST, this.window.location.host);
                item.url = item.url.replace(PROTOCOL, this.window.location.protocol);

                return item;
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
