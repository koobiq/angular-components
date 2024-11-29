import { ChangeDetectionStrategy, Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'kbq-stepper',
    template: `
        <i
            class="kbq-stepper-step-up"
            [small]="true"
            [tabindex]="-1"
            [autoColor]="true"
            (mousedown)="onStepUp($event)"
            color="contrast-fade"
            kbq-icon-button="kbq-chevron-down_16"
        ></i>
        <i
            class="kbq-stepper-step-down"
            [small]="true"
            [tabindex]="-1"
            [autoColor]="true"
            (mousedown)="onStepDown($event)"
            color="contrast-fade"
            kbq-icon-button="kbq-chevron-down_16"
        ></i>
    `,
    styleUrls: ['stepper.scss'],
    host: {
        class: 'kbq-stepper'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqStepper {
    @Output()
    readonly stepUp: EventEmitter<void> = new EventEmitter<void>();
    @Output()
    readonly stepDown: EventEmitter<void> = new EventEmitter<void>();

    connectTo(numberInput: any) {
        if (!numberInput) {
            return;
        }

        this.stepUp.subscribe(() => {
            numberInput.stepUp(numberInput.step);
        });

        this.stepDown.subscribe(() => {
            numberInput.stepDown(numberInput.step);
        });
    }

    onStepUp($event: MouseEvent) {
        this.stepUp.emit();
        $event.preventDefault();
    }

    onStepDown($event: MouseEvent) {
        this.stepDown.emit();
        $event.preventDefault();
    }
}
