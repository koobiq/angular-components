import { afterNextRender, DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import docsearch, { DocSearchInstance, DocSearchProps } from '@docsearch/js';
import { KBQ_WINDOW, ThemeService } from '@koobiq/components/core';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { docsIsRuLocale, DocsLocaleState } from '../../services/locale';

const SELECTOR = 'docs-docsearch';
const HOST = 'koobiq.io';
const PROTOCOL = 'https:';

type AnyFunction = (...args: unknown[]) => unknown;

/**
 * Forces every non-function translation leaf to be provided so a newly added key
 * (e.g. from enabling Ask AI) fails at compile time instead of silently rendering
 * an empty string in the UI. Function-valued overrides stay optional since they
 * have no meaningful "required" value.
 */
type DeepRequired<T> = T extends AnyFunction
    ? T
    : T extends object
      ? { [K in keyof T as T[K] extends AnyFunction | undefined ? never : K]-?: DeepRequired<T[K]> } & {
            [K in keyof T as T[K] extends AnyFunction | undefined ? K : never]?: T[K];
        }
      : T;

const TRANSLATION_RU: DeepRequired<NonNullable<DocSearchProps['translations']>> = {
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
            placeholderText: 'Поиск в документации',
            placeholderTextAskAi: 'Задайте вопрос ИИ-ассистенту',
            placeholderTextAskAiStreaming: 'Получаем ответ…',
            enterKeyHint: 'Enter',
            enterKeyHintAskAi: 'Enter',
            searchInputLabel: 'Поиск',
            backToKeywordSearchButtonText: 'Вернуться к поиску',
            backToKeywordSearchButtonAriaLabel: 'Вернуться к поиску',
            newConversationPlaceholder: 'Задайте новый вопрос',
            conversationHistoryTitle: 'История диалогов',
            startNewConversationText: 'Начать новый диалог',
            viewConversationHistoryText: 'Показать историю диалогов',
            threadDepthErrorPlaceholder: 'Достигнута максимальная длина диалога'
        },
        newConversation: {
            newConversationTitle: 'Новый диалог с ИИ',
            newConversationDescription: 'Задайте вопрос, и ИИ-ассистент найдёт ответ в документации'
        },
        startScreen: {
            recentSearchesTitle: 'Недавние',
            noRecentSearchesText: 'Нет недавних поисков',
            saveRecentSearchButtonTitle: 'Сохранить этот поиск',
            removeRecentSearchButtonTitle: 'Удалить этот поиск из истории',
            favoriteSearchesTitle: 'Избранное',
            removeFavoriteSearchButtonTitle: 'Удалить этот поиск из избранного',
            recentConversationsTitle: 'Недавние диалоги',
            removeRecentConversationButtonTitle: 'Удалить этот диалог из истории'
        },
        errorScreen: {
            titleText: 'Не удалось получить результаты',
            helpText: 'Возможно, вам следует проверить соединение с интернетом.'
        },
        footer: {
            selectText: 'Выбрать',
            submitQuestionText: 'Задать вопрос',
            selectKeyAriaLabel: 'Клавиша Enter',
            navigateText: 'Вниз (вверх)',
            navigateUpKeyAriaLabel: 'Клавиша стрелка вверх',
            navigateDownKeyAriaLabel: 'Клавиша стрелка вниз',
            closeText: 'Закрыть',
            backToSearchText: 'Вернуться к поиску',
            closeKeyAriaLabel: 'Клавиша Escape',
            poweredByText: 'Работает на'
        },
        noResultsScreen: {
            noResultsText: 'Нет результатов для',
            suggestedQueryText: 'Попробуйте поискать',
            reportMissingResultsText: 'Считаете, что этот запрос должен вернуть результаты?',
            reportMissingResultsLinkText: 'Сообщите нам.'
        },
        resultsScreen: {
            askAiPlaceholder: 'Спросить ИИ-ассистента:',
            noResultsAskAiPlaceholder: 'Спросить ИИ-ассистента вместо этого:'
        },
        askAiScreen: {
            disclaimerText: 'Ответы ИИ-ассистента могут быть неточными. Проверяйте важную информацию.',
            relatedSourcesText: 'Источники',
            thinkingText: 'Думаю…',
            copyButtonText: 'Копировать',
            copyButtonCopiedText: 'Скопировано',
            copyButtonTitle: 'Копировать ответ',
            likeButtonTitle: 'Полезный ответ',
            dislikeButtonTitle: 'Бесполезный ответ',
            thanksForFeedbackText: 'Спасибо за отзыв!',
            preToolCallText: 'Ищу',
            duringToolCallText: 'Ищу',
            afterToolCallText: 'Найдено по запросу',
            stoppedStreamingText: 'Генерация ответа остановлена',
            errorTitleText: 'Не удалось получить ответ',
            startNewConversationButtonText: 'Начать новый диалог'
        }
    }
};

/** Algolia DocSearch component implementation */
@Directive({
    selector: SELECTOR,
    host: {
        class: 'layout-align-center-center'
    }
})
export class DocsDocsearchDirective extends DocsLocaleState {
    private readonly window = inject(KBQ_WINDOW);
    private readonly destroyRef = inject(DestroyRef);
    private readonly theme = inject(ThemeService);

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
            this.theme.current.pipe(
                map(
                    (theme) =>
                        (theme?.className.replace('kbq-', '') === 'dark'
                            ? 'dark'
                            : 'light') satisfies DocSearchProps['theme'],
                    distinctUntilChanged()
                )
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
                        { name: 'koobiq', searchParameters: { hitsPerPage: 40, facetFilters: [`lang:${locale}`] } }
                    ],
                    transformItems: this.transformItems,
                    translations: docsIsRuLocale(locale) ? TRANSLATION_RU : {},
                    askAi: {
                        assistantId: 'f6ddad78-2e0d-4f11-8cf0-d7e34c354d0e',
                        agentStudio: true
                    }
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
