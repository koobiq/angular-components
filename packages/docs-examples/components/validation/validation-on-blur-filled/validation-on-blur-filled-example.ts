import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    inject,
    Injectable,
    viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    FormControl,
    FormGroupDirective,
    NgControl,
    NgForm,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import {
    ErrorStateMatcher,
    KbqComponentColors,
    kbqDisableLegacyValidationDirectiveProvider,
    kbqErrorStateMatcherProvider,
    PopUpPlacements
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { fromEvent, switchMap } from 'rxjs';
import { take } from 'rxjs/operators';

const IP_PATTERN =
    /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

const restSymbolsRegex = /[^0-9.]+/g;

@Injectable()
export class CustomErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !!(control?.invalid && control.touched && (form?.submitted ?? true));
    }
}

@Directive({
    selector: '[exampleResetTouchedOnFirstInput]',
    exportAs: 'exampleResetTouchedOnFirstInput'
})
class ExampleResetTouchedOnFirstInput {
    protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    protected readonly control = inject(NgControl, { optional: true, host: true });

    constructor() {
        const inputEvent = fromEvent(this.elementRef.nativeElement, 'input').pipe(take(1));

        fromEvent(this.elementRef.nativeElement, 'focus')
            .pipe(
                switchMap(() => inputEvent),
                takeUntilDestroyed()
            )
            .subscribe(() => {
                if (this.control?.control) {
                    this.control.control.markAsUntouched();
                }
            });
    }
}

/**
 * @title Validation on blur filled
 */
@Component({
    selector: 'validation-on-blur-filled-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqToolTipModule,
        ExampleResetTouchedOnFirstInput
    ],
    template: `
        <kbq-form-field style="width: 320px;">
            <kbq-label>IPv4-address</kbq-label>
            <input
                kbqInput
                exampleResetTouchedOnFirstInput
                [formControl]="ipAddressControl"
                [kbqEnterDelay]="10"
                [kbqPlacement]="popUpPlacements.Top"
                [kbqTrigger]="'manual'"
                [kbqTooltip]="'Numbers and dot only'"
                [kbqTooltipColor]="colors.Error"
                (input)="onInput($event)"
            />

            <kbq-error>The IP address does not comply with RFC standards</kbq-error>

            <kbq-cleaner />
        </kbq-form-field>
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    },
    providers: [
        kbqDisableLegacyValidationDirectiveProvider(),
        kbqErrorStateMatcherProvider(CustomErrorStateMatcher)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationOnBlurFilledExample {
    protected readonly tooltip = viewChild(KbqTooltipTrigger);
    protected readonly ipAddressControl = new FormControl('123...12123123', [
        Validators.pattern(IP_PATTERN)
    ]);

    constructor() {
        afterNextRender(() => {
            this.ipAddressControl.markAsTouched();
            this.ipAddressControl.updateValueAndValidity();
        });
    }

    protected readonly colors = KbqComponentColors;
    protected readonly popUpPlacements = PopUpPlacements;

    onInput(event: Event): void {
        const allowedSymbolsRegex = /^[0-9.]+$/g;

        if (
            event.target instanceof HTMLInputElement &&
            event.target.value &&
            !allowedSymbolsRegex.test(event.target.value)
        ) {
            const newValue = event.target.value.replace(restSymbolsRegex, '');

            this.ipAddressControl.setValue(newValue);

            const tooltip = this.tooltip();

            if (tooltip && !tooltip.isOpen) {
                tooltip.show();

                setTimeout(() => tooltip.hide(), 3000);
            }
        }
    }
}
