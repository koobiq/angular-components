import {
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
    ValidatorFn,
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
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
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
    standalone: true,
    selector: '[exampleResetTouchedOnFirstInput]',
    exportAs: 'exampleResetTouchedOnFirstInput'
})
class ExampleResetTouchedOnFirstInput {
    protected readonly elementRef = inject(ElementRef);
    protected readonly control = inject(NgControl, { optional: true, host: true });
    protected validators: ValidatorFn | null = null;

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
 * @title Inline edit validation
 */
@Component({
    standalone: true,
    imports: [
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconModule,
        KbqToolTipModule,
        ExampleResetTouchedOnFirstInput
    ],
    selector: 'inline-edit-validation-example',
    template: `
        <kbq-inline-edit [validationTooltip]="'Error message'" [tooltipPlacement]="popupPlacements.BottomLeft">
            <kbq-label>Not empty</kbq-label>

            <div class="example-inline-text" kbqInlineEditViewMode>
                @if (!inputControl.value) {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                } @else {
                    <span>
                        {{ inputControl.value }}
                    </span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput placeholder="Placeholder" [formControl]="inputControl" />
            </kbq-form-field>
        </kbq-inline-edit>

        <kbq-inline-edit
            [validationTooltip]="'Invalid IP: RFC non-compliant'"
            [tooltipPlacement]="popupPlacements.BottomLeft"
        >
            <kbq-label>IP-address</kbq-label>

            <div class="example-inline-text" kbqInlineEditViewMode>
                @if (!ipAddressControl.value) {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                } @else {
                    <span>
                        {{ ipAddressControl.value }}
                    </span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <input
                    kbqInput
                    exampleResetTouchedOnFirstInput
                    [formControl]="ipAddressControl"
                    [kbqEnterDelay]="10"
                    [kbqPlacement]="popUpPlacements.BottomLeft"
                    [kbqTrigger]="'manual'"
                    [kbqTooltip]="'Numbers and dots only'"
                    [kbqTooltipColor]="colors.Warning"
                    [kbqTooltipArrow]="false"
                    (input)="onInput($event)"
                />
            </kbq-form-field>
        </kbq-inline-edit>
    `,
    styles: `
        .example-inline-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `,
    host: {
        class: 'layout-flex layout-column'
    },
    providers: [
        kbqDisableLegacyValidationDirectiveProvider(),
        kbqErrorStateMatcherProvider(CustomErrorStateMatcher)],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditValidationExample {
    protected readonly tooltip = viewChild(KbqTooltipTrigger);

    protected readonly placeholder = 'Placeholder';
    protected readonly ipAddressControl = new FormControl<string>('192.168.0.2', {
        nonNullable: true,
        validators: [Validators.pattern(IP_PATTERN)]
    });
    protected readonly inputControl = new FormControl<string>('Value', {
        nonNullable: true,
        validators: [Validators.required]
    });
    protected readonly popupPlacements = PopUpPlacements;

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

    protected readonly popUpPlacements = PopUpPlacements;
    protected readonly colors = KbqComponentColors;
}
