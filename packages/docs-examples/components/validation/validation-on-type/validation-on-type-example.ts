import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Validation on type
 */
@Component({
    standalone: true,
    selector: 'validation-on-type-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqToolTipModule,
        KbqInputModule
    ],
    templateUrl: 'validation-on-type-example.html'
})
export class ValidationOnTypeExample {
    popUpPlacements = PopUpPlacements;

    checkOnFlyForm: FormGroup;

    @ViewChild('tooltip', { static: false }) tooltip: any;

    constructor() {
        this.checkOnFlyForm = new FormGroup({
            folderName: new FormControl('')
        });
    }

    onInput(event) {
        const regex = /^[\d\w]+$/g;

        if (!regex.test(event.target.value)) {
            const newValue = event.target.value.replace(/[^\d\w]+/g, '');
            this.checkOnFlyForm.controls.folderName.setValue(newValue);

            if (!this.tooltip.isTooltipOpen) {
                this.tooltip.show();

                setTimeout(() => this.tooltip.hide(), 3000);
            }
        }
    }
}
