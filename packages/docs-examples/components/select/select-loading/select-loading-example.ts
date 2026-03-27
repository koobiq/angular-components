import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { KbqHighlightPipe } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { from, Observable, timer } from 'rxjs';

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
            <kbq-button-toggle-group [(value)]="selectedDelayTime">
                <kbq-button-toggle [value]="100">100 ms</kbq-button-toggle>
                <kbq-button-toggle [value]="250">250 ms</kbq-button-toggle>
                <kbq-button-toggle [value]="500">500 ms</kbq-button-toggle>
                <kbq-button-toggle [value]="3000">3000 ms</kbq-button-toggle>
            </kbq-button-toggle-group>

            <kbq-form-field>
                <kbq-select placeholder="Placeholder" (click)="loadOptions()" (closed)="resetOptions()">
                    <kbq-form-field kbqFormFieldWithoutBorders kbqSelectSearch>
                        <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                        <input kbqInput type="text" [formControl]="searchControl" />
                        <kbq-cleaner />
                    </kbq-form-field>

                    <div kbq-select-search-empty-result>Nothing found</div>

                    @for (option of filteredOptions | async; track option) {
                        <kbq-option [value]="option">
                            <span [innerHTML]="option | mcHighlight: searchControl.value"></span>
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
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    selectedDelayTime = 3000;

    readonly options = Array
        .from({ length: 10 })
        .map((_, i) => `Option #${i}`);
    readonly searchControl = new FormControl();
    filteredOptions: Observable<any> = from([]);

    private search(query: string | null): string[] {
        return query
            ? this.options.filter((option) => option.toLowerCase().includes(query.toLowerCase()))
            : this.options;
    }

    private getOptions = () => {
        this.filteredOptions = this.searchControl.valueChanges.pipe(
            startWith(''),
            map((query) => this.search(query))
        );

        this.changeDetectorRef.markForCheck();
    }

    protected loadOptions() {
        timer(this.selectedDelayTime).subscribe(this.getOptions);

    }

    protected resetOptions() {
        this.filteredOptions = from([]);
    }
}
