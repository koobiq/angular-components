import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { KbqHighlightPipe } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { delay, Observable, race, Subject, switchMap, tap, throwError, timer } from 'rxjs';
import { map, take } from 'rxjs/operators';


type Option = {
    id: number;
    label: string;
};

export class OptionsService {
    private delay: number = 100;

    private data = Array
        .from({ length: 10 })
        .map((_, i) => ({ id: i, label: `Option #${i}` }));

    private readonly empty = new Subject<void>();

    setEmpty(): void {
        this.empty.next();
    }

    setDelay(delay: number) {
        this.delay = delay;
    }

    getOptions(search: string, shouldFail: boolean = false): Observable<Option[]> {
        if (shouldFail) {
            return throwError(() => new Error('error')).pipe(delay(this.delay));
        }

        const term = search.toLowerCase().trim();

        const filtered = !term
            ? this.data
            : this.data.filter((option) => option.label.toLowerCase().includes(term));

        return race(
            timer(this.delay).pipe(map(() => filtered)),
            this.empty.pipe(
                take(1),
                map(() => [] as Option[])
            )
        );
    }
}

/**
 * @title Select loading
 */
@Component({
    selector: 'select-loading-example',
    imports: [
        KbqSelectModule,
        KbqButtonToggleModule,
        AsyncPipe,
        FormsModule,
        KbqHighlightPipe,
        KbqIconModule,
        KbqInputModule,
        ReactiveFormsModule
    ],
    template: `
        <div class="layout-column layout-align-center-start layout-gap-l">
            <!--            @defer (on timer(1000)) {-->
            <!--                <p>Main Defer</p>-->
            <!--            } @placeholder (minimum 5000ms) {-->
            <!--                <p>Placeholder content</p>-->
            <!--            } @loading (after 100ms; minimum 1s) {-->
            <!--                <p>App-loading-spinner</p>-->
            <!--            } @error {-->
            <!--                <p>Failed to load the component.</p>-->
            <!--            }-->
            <kbq-button-toggle-group
                [ngModel]="100"
                (ngModelChange)="service.setDelay($event)">
                <kbq-button-toggle [value]="100">100 ms</kbq-button-toggle>
                <kbq-button-toggle [value]="250">250 ms</kbq-button-toggle>
                <kbq-button-toggle [value]="500">500 ms</kbq-button-toggle>
                <kbq-button-toggle [value]="3000">3000 ms</kbq-button-toggle>
            </kbq-button-toggle-group>

            <kbq-form-field>
                <kbq-select placeholder="Placeholder"
                            (beforeOpened)="searchControl.setValue('')"
                            (closed)="resetOptions()">
                    <kbq-form-field kbqFormFieldWithoutBorders kbqSelectSearch>
                        <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                        <input kbqInput type="text" [formControl]="searchControl" autocomplete="off" />
                        <kbq-cleaner />
                    </kbq-form-field>

                    <div kbq-select-search-empty-result>Nothing found</div>

                    @for (option of filteredOptions$ | async; track option) {
                        <kbq-option [value]="option.id">
                            <span [innerHTML]="option.label | mcHighlight: searchControl.value"></span>
                        </kbq-option>
                    }
                </kbq-select>

                <!--                <kbq-select [value]="selected">-->
                <!--                    @defer (on timer(5000)) {-->
                <!--                        @for (option of options; track option) {-->
                <!--                            <kbq-option [value]="option">{{ option }}</kbq-option>-->
                <!--                        }-->
                <!--                    }-->
                <!--                    @placeholder {-->
                <!--                        <p>Placeholder content</p>-->
                <!--                    }-->
                <!--                    @loading (after 100ms; minimum 1s) {-->
                <!--                        <p>App-loading-spinner</p>-->
                <!--                    }-->
                <!--                    @error {-->
                <!--                        <p>Failed to load the component.</p>-->
                <!--                    }-->
                <!--                </kbq-select>-->
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
export class SelectLoadingExample {
    service = new OptionsService();

    readonly select = viewChild.required(KbqSelect);

    readonly searchControl = new FormControl('', { nonNullable: true });

    readonly filteredOptions$ = this.searchControl.valueChanges.pipe(
        tap(() => this.select().loadingWithDelay.next(true)),
        switchMap((search: string) => this.service.getOptions(search)),
        tap(() => this.select().loadingWithDelay.next(false))
    );

    protected resetOptions() {
        this.service.setEmpty();
    }
}
