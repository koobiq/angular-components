import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
    delayBeforeDisplayingResultWithoutOptions,
    KbqSelectModule,
    minimumTimeToDisplayLoading
} from '@koobiq/components/select';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import {
    BehaviorSubject,
    catchError,
    Observable,
    of,
    race,
    switchMap,
    throwError,
    timer
} from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { KbqHighlightPipe } from '@koobiq/components/core';
import { KbqButtonModule } from '@koobiq/components/button';


type Option = {
    id: number;
    label: string;
};

export class OptionsApiService {
    private delay: number = 100;

    private data = Array
        .from({ length: 10 })
        .map((_, i) => ({ id: i, label: `Option #${i}` }));

    setDelay(delay: number) {
        this.delay = delay;
    }

    getOptions(search: string): Observable<Option[]> {
        if (search === 'error') {
            return throwError(() => new Error('error'));
        }

        const term = search.toLowerCase().trim();

        const filtered = !term
            ? this.data
            : this.data.filter((option) => option.label.toLowerCase().includes(term));

        return timer(this.delay).pipe(map(() => filtered));
    }
}

export class SelectFacade {
    private readonly api = inject(OptionsApiService);
    private readonly search$ = new BehaviorSubject<string | null>(null);

    reset(): void {
        this.search$.next(null);
    }

    setSearch(value: string) {
        this.search$.next(value);
    }

    readonly state$ = this.search$.pipe(
        // for use in a real project
        // debounceTime(300),
        // distinctUntilChanged(),
        switchMap((search) => {
            if (search === null) {
                return of({ status: 'idle' } as const);
            }

            const request$ = this.api.getOptions(search).pipe(
                map((data) =>
                    data.length === 0
                        ? ({ status: 'empty' } as const)
                        : ({ status: 'success', data } as const)
                ),
                catchError((error: any) =>
                    of({ status: 'error', error } as const)
                )
            );

            return race(
                request$,
                timer(delayBeforeDisplayingResultWithoutOptions).pipe(
                    switchMap(() => {
                        return request$.pipe(
                            startWith({ status: 'loading' } as const),
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
        })
    )
}

/**
 * @title Select loading error
 */
@Component({
    selector: 'select-loading-error-example',
    imports: [
        KbqSelectModule,
        FormsModule,
        KbqIconModule,
        KbqInputModule,
        ReactiveFormsModule,
        AsyncPipe,
        KbqHighlightPipe,
        KbqButtonModule
    ],
    providers: [SelectFacade, OptionsApiService],
    template: `
        <div class="layout-column layout-align-center-start layout-gap-l">
            <kbq-form-field>
                <kbq-select
                    (beforeOpened)="loadOptions()"
                    (closed)="resetOptions()">
                    <kbq-form-field noBorders kbqSelectSearch>
                        <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                        <input kbqInput type="text" [formControl]="searchControl" autocomplete="off" />
                        <kbq-cleaner />
                    </kbq-form-field>

                    @if (state$ | async; as state) {
                        @switch (state.status) {
                            @case ('loading') {
                                <kbq-select-loading />
                            }
                            @case ('empty') {
                                <div kbq-select-search-empty-result>Ничего не найдено</div>
                            }
                            @case ('error') {
                                <kbq-select-error>
                                    <span [style.color]="'var(--kbq-foreground-error)'">Не удалось показать записи</span>
                                    <button kbq-button [kbqStyle]="'transparent'" [color]="'theme'" (click)="reloadOptions()">
                                        <i kbq-icon="kbq-arrow-rotate-left_16"></i>
                                        Повторить
                                    </button>
                                </kbq-select-error>
                            }
                            @case ('success') {
                                @for (option of state.data; track option) {
                                    <kbq-option [value]="option">
                                        <span [innerHTML]="option.label | mcHighlight: searchControl.value"></span>
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
export class SelectLoadingErrorExample {
    protected readonly facade = inject(SelectFacade);

    readonly state$ = this.facade.state$;
    readonly searchControl = new FormControl('');

    protected resetOptions() {
        // used as an example to show loading every time the select is opened
        this.facade.reset();
    }

    protected loadOptions() {
        // used as an example to show loading every time the select is opened
        this.searchControl.setValue('error');
    }

    protected reloadOptions() {
        // used as an example to demonstrate a repeated request
        this.searchControl.setValue('');
    }

    constructor() {
        this.searchControl.valueChanges
            .subscribe((value) => this.facade.setSearch(value ?? ''));
    }
}
