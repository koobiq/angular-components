import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqHighlightPipe } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import {
    delayBeforeDisplayingResultWithoutOptions,
    KbqSelectModule,
    minimumTimeToDisplayLoading
} from '@koobiq/components/select';
import { BehaviorSubject, catchError, Observable, of, race, switchMap, throwError, timer } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

type Option = {
    id: number;
    label: string;
};

export class OptionsApiService {
    private delay: number = 100;

    private data = Array.from({ length: 10 }).map((_, i) => ({ id: i, label: `Option #${i}` }));

    setDelay(delay: number) {
        this.delay = delay;
    }

    getOptions(search: string): Observable<Option[]> {
        if (search === 'error') {
            return throwError(() => new Error('error'));
        }

        const term = search.toLowerCase().trim();

        const filtered = !term ? this.data : this.data.filter((option) => option.label.toLowerCase().includes(term));

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

    setDelay(delay: number) {
        this.api.setDelay(delay);
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
                    data.length === 0 ? ({ status: 'empty' } as const) : ({ status: 'success', data } as const)
                ),
                catchError((error: any) => of({ status: 'error', error } as const))
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
        }),
        startWith({ status: 'error', error: { message: 'error message' } } as const)
    );
}

/**
 * @title Select loading
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
        KbqButtonModule
    ],
    providers: [SelectFacade, OptionsApiService],
    template: `
        <div class="layout-column layout-align-center-start layout-gap-l">
            <div class="layout-column layout-gap-xs">
                Option Loading Time
                <kbq-button-toggle-group [ngModel]="100" (ngModelChange)="facade.setDelay($event)">
                    <kbq-button-toggle [value]="100">100 ms</kbq-button-toggle>
                    <kbq-button-toggle [value]="250">250 ms</kbq-button-toggle>
                    <kbq-button-toggle [value]="500">500 ms</kbq-button-toggle>
                    <kbq-button-toggle [value]="3000000">3000 ms</kbq-button-toggle>
                </kbq-button-toggle-group>
            </div>

            <kbq-form-field>
                <kbq-select [value]="selectedOption" (beforeOpened)="loadOptions()" (closed)="resetOptions()">
                    <kbq-form-field noBorders kbqSelectSearch>
                        <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                        <input kbqInput type="text" autocomplete="off" [formControl]="searchControl" />
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
                                <!--{{ state.error.message }}-->
                                <kbq-select-error>
                                    <span #errorText>Не удалось показать записи</span>
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
                                @for (option of state.data; track option) {
                                    <kbq-option [value]="option.id">
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
export class SelectPagingExample {
    protected readonly facade = inject(SelectFacade);

    protected selectedOption: Option = { id: 0, label: `Option 0` };

    readonly state$ = this.facade.state$;
    readonly searchControl = new FormControl('');

    protected resetOptions() {
        // used as an example to show loading every time the select is opened
        this.facade.reset();
    }

    protected loadOptions() {
        // used as an example to show loading every time the select is opened
        this.searchControl.setValue('');
    }

    protected reloadOptions() {
        // used as an example to demonstrate a repeated request
        this.searchControl.setValue('');
    }

    constructor() {
        this.searchControl.valueChanges.subscribe((value) => this.facade.setSearch(value ?? ''));
    }
}
