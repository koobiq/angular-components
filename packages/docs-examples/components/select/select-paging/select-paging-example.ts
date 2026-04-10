import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, NgZone, OnDestroy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqHighlightPipe } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import {
    delayBeforeDisplayingResultWithoutOptions,
    KbqSelect,
    KbqSelectModule,
    minimumTimeToDisplayLoading
} from '@koobiq/components/select';
import {
    BehaviorSubject,
    catchError,
    exhaustMap,
    fromEvent,
    merge,
    Observable,
    of,
    race,
    Subject,
    Subscription,
    switchMap,
    timer
} from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';

type Option = {
    id: number;
    label: string;
};

type PagedResult = {
    data: Option[];
    hasMore: boolean;
};

type SelectState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'empty' }
    | { status: 'error'; error: any }
    | { status: 'success'; data: Option[]; hasMore: boolean; loadingMore: boolean };

const PAGE_SIZE = 20;
const DELAY = 1000;

export class OptionsApiService {
    private data = Array.from({ length: 100 }).map((_, i) => ({ id: i, label: `Option #${i}` }));

    getOptions(
        search: string,
        page: number = 0,
        delay: number = DELAY,
        pageSize: number = PAGE_SIZE
    ): Observable<PagedResult> {
        const term = search.toLowerCase().trim();

        const filtered = !term ? this.data : this.data.filter((option) => option.label.toLowerCase().includes(term));

        const start = page * pageSize;
        const end = start + pageSize;
        const pageData = filtered.slice(start, end);
        const hasMore = end < filtered.length;

        return timer(delay).pipe(map(() => ({ data: pageData, hasMore })));
    }
}

export class SelectFacade {
    private readonly api = inject(OptionsApiService);
    private readonly search$ = new BehaviorSubject<string | null>(null);
    readonly loadMore$ = new Subject<void>();

    private accumulated: Option[] = [];
    private currentPage = 0;
    private currentHasMore = false;
    private isLoadingMore = false;

    reset(): void {
        this.search$.next(null);
    }

    setSearch(value: string) {
        this.search$.next(value);
    }

    loadMore(): void {
        if (!this.currentHasMore || this.isLoadingMore) return;

        this.loadMore$.next();
    }

    readonly state$: Observable<SelectState> = this.search$.pipe(
        // for use in a real project
        // debounceTime(300),
        // distinctUntilChanged(),
        switchMap((search) => {
            if (search === null) {
                return of({ status: 'idle' } as SelectState);
            }

            this.accumulated = [];
            this.currentPage = 0;
            this.currentHasMore = false;
            this.isLoadingMore = false;

            const request$ = this.api.getOptions(search, 0, 0).pipe(
                map((result): SelectState => {
                    if (result.data.length === 0) {
                        return { status: 'empty' };
                    }

                    this.accumulated = result.data;
                    this.currentHasMore = result.hasMore;

                    return { status: 'success', data: this.accumulated, hasMore: result.hasMore, loadingMore: false };
                }),
                catchError((error: any) => of({ status: 'error', error } as SelectState))
            );

            const initialLoad$ = race(
                request$,
                timer(delayBeforeDisplayingResultWithoutOptions).pipe(
                    switchMap(() => {
                        return request$.pipe(
                            startWith({ status: 'loading' } as SelectState),
                            switchMap((state) => {
                                if (state.status === 'loading') {
                                    return of(state);
                                }

                                return timer(minimumTimeToDisplayLoading).pipe(map(() => state));
                            })
                        );
                    })
                )
            );

            const loadMore$ = this.loadMore$.pipe(
                exhaustMap(() => {
                    this.currentPage++;
                    this.isLoadingMore = true;

                    return this.api.getOptions(search, this.currentPage, DELAY).pipe(
                        map((result): SelectState => {
                            this.accumulated = [...this.accumulated, ...result.data];
                            this.currentHasMore = result.hasMore;
                            this.isLoadingMore = false;

                            return {
                                status: 'success',
                                data: this.accumulated,
                                hasMore: result.hasMore,
                                loadingMore: false
                            };
                        }),
                        startWith({
                            status: 'success',
                            data: this.accumulated,
                            hasMore: true,
                            loadingMore: true
                        } as SelectState)
                    );
                })
            );

            return merge(
                initialLoad$.pipe(
                    tap((state) => {
                        if (state.status === 'success') {
                            this.accumulated = state.data;
                        }
                    })
                ),
                loadMore$
            );
        })
    );
}

/**
 * @title Select paging
 */
@Component({
    selector: 'select-paging-example',
    imports: [
        KbqSelectModule,
        KbqButtonToggleModule,
        FormsModule,
        KbqIconModule,
        KbqInputModule,
        ReactiveFormsModule,
        AsyncPipe,
        KbqHighlightPipe,
        KbqButtonModule,
        KbqProgressSpinnerModule
    ],
    providers: [SelectFacade, OptionsApiService],
    template: `
        <div class="layout-column layout-align-center-start layout-gap-l">
            <kbq-form-field>
                <kbq-select
                    #select
                    [value]="selectedOption"
                    (beforeOpened)="reloadOptions()"
                    (opened)="onSelectOpened(select)"
                    (closed)="onSelectClosed()"
                >
                    <kbq-form-field noBorders kbqSelectSearch>
                        <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                        <input kbqInput type="text" autocomplete="off" [formControl]="searchControl" />
                        <kbq-cleaner />
                    </kbq-form-field>

                    @if (facade.state$ | async; as state) {
                        @switch (state.status) {
                            @case ('loading') {
                                <kbq-select-loading />
                            }
                            @case ('empty') {
                                <div kbq-select-search-empty-result>Ничего не найдено</div>
                            }
                            @case ('error') {
                                <kbq-select-error>
                                    <span kbq-select-error-text>Не удалось показать записи</span>
                                    <button
                                        kbq-button
                                        [kbqStyle]="'transparent'"
                                        [color]="'theme'"
                                        (click)="reloadOptions()"
                                    >
                                        <i kbq-icon="kbq-arrow-rotate-left_16"></i>
                                        Повторить
                                    </button>
                                </kbq-select-error>
                            }
                            @case ('success') {
                                @for (option of state.data; track option.id) {
                                    <kbq-option [value]="option.id">
                                        <span [innerHTML]="option.label | mcHighlight: searchControl.value"></span>
                                    </kbq-option>
                                }

                                @if (state.loadingMore) {
                                    <kbq-option [disabled]="true">
                                        <div class="layout-row layout-align-start-center">
                                            <kbq-progress-spinner [mode]="'indeterminate'" />
                                            <span class="layout-padding-left-s">Загрузка</span>
                                        </div>
                                    </kbq-option>
                                }
                            }
                        }
                    }
                </kbq-select>
            </kbq-form-field>
        </div>
    `,
    styles: `
        .kbq-form-field {
            width: 320px;
        }
    `,
    host: {
        class: 'layout-margin-5xl layout-column layout-align-center-center'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectPagingExample implements OnDestroy {
    protected readonly facade = inject(SelectFacade);
    private readonly ngZone = inject(NgZone);

    protected selectedOption: Option = { id: 0, label: `Option 0` };

    readonly searchControl = new FormControl('');

    private scrollSub: Subscription | null = null;

    protected onSelectOpened(select: KbqSelect) {
        const scrollContainer = select.optionsContainer?.nativeElement;

        if (!scrollContainer) return;

        this.ngZone.runOutsideAngular(() => {
            this.scrollSub = fromEvent(scrollContainer, 'scroll').subscribe(() => {
                const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

                if (scrollTop + clientHeight >= scrollHeight - 30) {
                    this.ngZone.run(() => this.facade.loadMore());
                }
            });
        });
    }

    protected onSelectClosed() {
        this.scrollSub?.unsubscribe();
        this.scrollSub = null;
        this.facade.reset();
    }

    // in beforeOpened used as an example to show loading every time the select is opened
    protected reloadOptions() {
        this.searchControl.setValue('');
    }

    ngOnDestroy() {
        this.scrollSub?.unsubscribe();
    }

    constructor() {
        this.searchControl.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe((value) => this.facade.setSearch(value ?? ''));
    }
}
