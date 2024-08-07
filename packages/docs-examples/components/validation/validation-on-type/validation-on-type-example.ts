import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PopUpPlacements } from '@koobiq/components/core';

/**
 * @title validation-on-type
 */
@Component({
    selector: 'validation-on-type-example',
    templateUrl: 'validation-on-type-example.html',
    styleUrls: ['validation-on-type-example.css'],
    encapsulation: ViewEncapsulation.None
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
