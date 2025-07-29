import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';

const restSymbolsRegex = /[^0-9a-zA-Z]+/g;

/**
 * @title Validation on type
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'validation-on-type-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqToolTipModule,
        KbqInputModule
    ],
    template: `
        <div class="layout-margin" style="width: 320px">
            <form [formGroup]="checkOnFlyForm" novalidate>
                <kbq-form-field>
                    <kbq-label>Folder name</kbq-label>
                    <input
                        #tooltip="kbqTooltip"
                        [kbqEnterDelay]="10"
                        [kbqPlacement]="popUpPlacements.Top"
                        [kbqTrigger]="'manual'"
                        [kbqTooltip]="'Letters and numbers'"
                        [kbqTooltipColor]="colors.Error"
                        (input)="onInput($event)"
                        formControlName="folderName"
                        kbqInput
                    />

                    <kbq-cleaner />

                    <kbq-hint>Only letters and numbers</kbq-hint>
                </kbq-form-field>
            </form>
        </div>
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ValidationOnTypeExample {
    @ViewChild('tooltip', { static: false }) tooltip: KbqTooltipTrigger;

    protected readonly popUpPlacements = PopUpPlacements;
    protected readonly colors = KbqComponentColors;

    protected readonly checkOnFlyForm = new FormGroup({
        folderName: new FormControl('')
    });

    onInput(event: Event): void {
        const regex = /^[0-9a-zA-Z]+$/g;

        if (event.target instanceof HTMLInputElement && event.target.value && !regex.test(event.target.value)) {
            const newValue = event.target.value.replace(restSymbolsRegex, '');

            this.checkOnFlyForm.controls.folderName.setValue(newValue);

            if (!this.tooltip.isOpen) {
                this.tooltip.show();

                setTimeout(() => this.tooltip.hide(), 3000);
            }
        }
    }
}
