import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
    KbqComponentColors,
    kbqDisableLegacyValidationDirectiveProvider,
    PopUpPlacements
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';

const restSymbolsRegex = /[^0-9a-zA-Zа-яА-ЯйЙёЁ]+/g;

/**
 * @title Validation on type
 */
@Component({
    selector: 'validation-on-type-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqToolTipModule,
        KbqInputModule
    ],
    template: `
        <form novalidate [formGroup]="checkOnFlyForm">
            <kbq-form-field>
                <kbq-label>Folder name</kbq-label>
                <input
                    #tooltip="kbqTooltip"
                    formControlName="folderName"
                    kbqInput
                    [kbqEnterDelay]="10"
                    [kbqPlacement]="popUpPlacements.Top"
                    [kbqTrigger]="'manual'"
                    [kbqTooltip]="'Letters and numbers'"
                    [kbqTooltipColor]="colors.Error"
                    (input)="onInput($event)"
                />

                <kbq-cleaner />

                <kbq-hint>Only letters and numbers</kbq-hint>
            </kbq-form-field>
        </form>
    `,
    styles: `
        form {
            width: 320px;
            padding: 1px;
        }
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    },
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationOnTypeExample {
    @ViewChild('tooltip', { static: false }) tooltip: KbqTooltipTrigger;

    protected readonly popUpPlacements = PopUpPlacements;
    protected readonly colors = KbqComponentColors;

    protected readonly checkOnFlyForm = new FormGroup({
        folderName: new FormControl('')
    });

    onInput(event: Event): void {
        const regex = /^[0-9a-zA-Zа-яА-ЯёЁйЙ]+$/g;

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
