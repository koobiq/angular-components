import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
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
        KbqToolTipModule,
        KbqInputModule
    ],
    template: `
        <form novalidate [formGroup]="checkOnFlyForm">
            <kbq-form-field>
                <kbq-label>Folder name</kbq-label>
                <input
                    formControlName="folderName"
                    kbqInput
                    [kbqEnterDelay]="10"
                    [kbqPlacement]="popUpPlacements.Top"
                    [kbqRelativeToCaret]="true"
                    [kbqTrigger]="'manual'"
                    [kbqTooltip]="'Letters and numbers'"
                    [kbqTooltipColor]="colors.Error"
                    (blur)="onBlur()"
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ValidationOnTypeExample {
    protected readonly tooltip = viewChild(KbqTooltipTrigger);

    protected readonly popUpPlacements = PopUpPlacements;
    protected readonly colors = KbqComponentColors;

    protected readonly checkOnFlyForm = new FormGroup({
        folderName: new FormControl('')
    });

    protected onInput(event: Event): void {
        if (!(event.target instanceof HTMLInputElement)) return;

        const { value } = event.target;
        const allowedValue = value.replace(restSymbolsRegex, '');

        // A valid character leaves nothing to filter out, so the hint goes as soon as one is typed.
        if (allowedValue === value) {
            this.tooltip()?.hide();

            return;
        }

        this.checkOnFlyForm.controls.folderName.setValue(allowedValue);
        this.tooltip()?.show();
    }

    protected onBlur(): void {
        this.tooltip()?.hide();
    }
}
