import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KbqComponentColors, KbqFormsModule, PopUpPlacements } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';

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
        KbqInputModule,
        KbqFormsModule
    ],
    template: `
        <div class="layout-margin" style="width: 400px">
            <form class="kbq-form-vertical" [formGroup]="checkOnFlyForm" novalidate>
                <div class="kbq-form__fieldset">
                    <div class="kbq-form__row">
                        <div class="kbq-form__label">Folder name</div>
                        <kbq-form-field
                            class="kbq-form__control"
                            #tooltip="kbqTooltip"
                            [kbqEnterDelay]="10"
                            [kbqPlacement]="popUpPlacements.Top"
                            [kbqTrigger]="'manual'"
                            [kbqTooltip]="'Буквы и цифры'"
                            [kbqTooltipColor]="colors.Error"
                        >
                            <input (input)="onInput($event)" formControlName="folderName" kbqInput />

                            <kbq-cleaner />

                            <kbq-hint>Only letters and numbers</kbq-hint>
                        </kbq-form-field>
                    </div>
                </div>
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
        const regex = /^[\d\w]+$/g;

        const target = event.target as HTMLInputElement | null;

        if (target?.value && !regex.test(target.value)) {
            const newValue = target.value.replace(/[^\d\w]+/g, '');

            this.checkOnFlyForm.controls.folderName.setValue(newValue);

            if (!this.tooltip.isOpen) {
                this.tooltip.show();

                setTimeout(() => this.tooltip.hide(), 3000);
            }
        }
    }
}
