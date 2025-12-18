import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
    KBQ_LOCALE_SERVICE,
    KbqDataSizePipe,
    KbqFormsModule,
    KbqMeasurementSystem,
    KbqNormalizeWhitespace,
    PopUpPlacements
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Filesize formatter
 */
@Component({
    selector: 'filesize-formatter-overview-example',
    imports: [
        ReactiveFormsModule,
        KbqDataSizePipe,
        KbqSelectModule,
        KbqIconModule,
        KbqFormFieldModule,
        KbqFormsModule,
        KbqInputModule,
        KbqToolTipModule,
        KbqNormalizeWhitespace
    ],
    template: `
        <form class="kbq-form-vertical" novalidate>
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <label class="kbq-form__label">Size in bits</label>
                    <kbq-form-field class="kbq-form__control">
                        <input kbqNumberInput kbqNormalizeWhitespace [min]="0" [formControl]="bytesControl" />
                        <kbq-stepper />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <label class="kbq-form__label">Numbers behind decimal point</label>
                    <kbq-form-field class="kbq-form__control">
                        <kbq-select [formControl]="precisionControl">
                            <kbq-option [value]="2">Default (2)</kbq-option>
                            <kbq-option [value]="0">0</kbq-option>
                            <kbq-option [value]="1">1</kbq-option>
                            <kbq-option [value]="2">2</kbq-option>
                            <kbq-option [value]="3">3</kbq-option>
                        </kbq-select>
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <label class="kbq-form__label">
                        Base
                        <i
                            kbq-icon="kbq-circle-question_16"
                            [color]="'contrast-fade'"
                            [style.cursor]="'help'"
                            [kbqPlacement]="popUpPlacements.Right"
                            [kbqTooltip]="tooltipText"
                        ></i>
                    </label>
                    <kbq-form-field class="kbq-form__control">
                        <kbq-select [formControl]="unitSystemNameControl">
                            <kbq-option [value]="kbqMeasurementSystem.SI">Default (10)</kbq-option>
                            <kbq-option [value]="kbqMeasurementSystem.IEC">2</kbq-option>
                            <kbq-option [value]="kbqMeasurementSystem.SI">10</kbq-option>
                        </kbq-select>
                    </kbq-form-field>
                </div>
            </div>
        </form>

        <div
            class="layout-padding-left-3xl layout-padding-right-3xl kbq-subheading layout-align-center-center layout-row example-filesize-formatter__result"
        >
            {{ bytesControl.value | kbqDataSize: precisionControl.value : unitSystemNameControl.value }}
        </div>

        <ng-template #tooltipText>
            <div>Base 10</div>
            <div>
                <span>
                    <span>1&nbsp;KB = 10</span>
                    <sup>3</sup>
                </span>
                bytes = 1000&nbsp;bytes (SI standard)
            </div>
            <div>Base 2</div>
            <div>
                <span>
                    <span>1&nbsp;KiB = 2</span>
                    <sup>10</sup>
                </span>
                bytes = 1024&nbsp;bytes (IEC)
            </div>
        </ng-template>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: row;
        }

        .example-filesize-formatter__result {
            background: var(--kbq-background-theme-less);
            border-radius: var(--kbq-size-border-radius);
            flex-grow: 1;
        }

        @media (width <= 768px) {
            :host {
                flex-direction: column-reverse;
            }

            .example-filesize-formatter__result {
                height: 90px;
                width: auto;
                max-width: unset;
            }
        }

        @media (width > 768px) {
            .kbq-form__control {
                width: 240px;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'example-filesize-formatter__container layout-gap-3xl layout-margin-bottom-s'
    }
})
export class FilesizeFormatterOverviewExample {
    protected readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    protected readonly cdr = inject(ChangeDetectorRef);
    protected readonly precisionControl = new FormControl(2, { nonNullable: true });
    protected readonly unitSystemNameControl = new FormControl<KbqMeasurementSystem>(KbqMeasurementSystem.SI, {
        nonNullable: true
    });
    protected readonly bytesControl = new FormControl(1024, { nonNullable: true });

    protected readonly kbqMeasurementSystem = KbqMeasurementSystem;
    protected readonly popUpPlacements = PopUpPlacements;

    constructor() {
        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(() => this.cdr.markForCheck());
    }
}
