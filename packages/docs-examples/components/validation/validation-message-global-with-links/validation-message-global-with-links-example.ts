import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule, PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLink } from '@koobiq/components/link';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';

const restSymbolsRegex = /[^0-9]+/g;

/**
 * @title Validation message global with links
 */
@Component({
    selector: 'validation-message-global-with-links-example',
    imports: [
        ReactiveFormsModule,
        KbqAlertModule,
        KbqIconModule,
        KbqInputModule,
        KbqButtonModule,
        KbqFormsModule,
        KbqLink,
        KbqToolTipModule,
        FormsModule
    ],
    templateUrl: 'validation-message-global-with-links-example.html',
    styles: `
        form {
            width: 320px;
            padding: 1px;
        }

        .example-alert {
            transition: opacity 50ms ease-in-out;
        }

        .example-alert.example-alert_in-progress {
            opacity: var(--kbq-opacity-disabled);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-column'
    }
})
export class ValidationMessageGlobalWithLinksExample {
    protected readonly popUpPlacements = PopUpPlacements;

    protected readonly inProgress = signal(false);
    protected readonly showError = signal(false);
    protected readonly form = new FormGroup({
        series: new FormControl(''),
        number: new FormControl(''),
        lastName: new FormControl(''),
        firstName: new FormControl(''),
        patronymic: new FormControl('')
    });

    onInput(event: Event, tooltip: KbqTooltipTrigger, control: FormControl): void {
        if (event.target instanceof HTMLInputElement && event.target.value && /\D/.test(event.target.value)) {
            control.setValue(event.target.value.replace(restSymbolsRegex, ''));

            if (!tooltip.isOpen) {
                tooltip.show();

                setTimeout(() => tooltip.hide(), 3000);
            }
        }
    }

    submitForm() {
        this.inProgress.set(true);

        setTimeout(() => {
            this.checkForm();
            this.inProgress.set(false);
        }, 1000);
    }

    checkForm() {
        this.showError.set(!this.isAnyRequiredFieldFilled());
    }

    // Bound to the form's bubbling input rather than to valueChanges: by then onInput has already stripped
    // the non-digits that Series and Number hold for a moment.
    hideErrorOnceFilled(): void {
        if (this.isAnyRequiredFieldFilled()) {
            this.showError.set(false);
        }
    }

    private isAnyRequiredFieldFilled(): boolean {
        const { series, number, lastName } = this.form.controls;

        return [series, number, lastName].some((control) => control.value);
    }
}
