import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';

const IP_PATTERN =
    /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

const restSymbolsRegex = /[^0-9.]+/g;

/**
 * @title Inline edit validation
 */
@Component({
    selector: 'inline-edit-validation-example',
    imports: [
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqInputModule,
        KbqIconModule,
        KbqToolTipModule
    ],
    template: `
        <kbq-inline-edit [validationTooltip]="'Error message'" [tooltipPlacement]="tooltipPlacement">
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

        <kbq-inline-edit [validationTooltip]="'Invalid IP: RFC non-compliant'" [tooltipPlacement]="tooltipPlacement">
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
                    [formControl]="ipAddressControl"
                    [kbqEnterDelay]="10"
                    [kbqPlacement]="tooltipPlacement"
                    [kbqTrigger]="'manual'"
                    [kbqTooltip]="'Numbers and dots only'"
                    [kbqTooltipColor]="tooltipColor"
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-flex layout-column'
    }
})
export class InlineEditValidationExample {
    protected readonly tooltip = viewChild(KbqTooltipTrigger);
    protected readonly tooltipPlacement = PopUpPlacements.BottomLeft;
    protected readonly tooltipColor = KbqComponentColors.Warning;
    protected readonly placeholder = 'Placeholder';

    protected readonly ipAddressControl = new FormControl<string>('192.168.0.2', {
        nonNullable: true,
        validators: [Validators.pattern(IP_PATTERN)]
    });
    protected readonly inputControl = new FormControl<string>('Value', {
        nonNullable: true,
        validators: [Validators.required]
    });

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
