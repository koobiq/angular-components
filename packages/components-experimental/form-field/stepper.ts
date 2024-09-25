import { ChangeDetectionStrategy, Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @TODO move into input module (#DS-2910)
 */

@Component({
    standalone: true,
    selector: 'kbq-stepper',
    template: `
        <i
            class="kbq-stepper-step-up"
            [small]="true"
            [tabindex]="-1"
            [autoColor]="true"
            (mousedown)="onStepUp($event)"
            kbq-icon-button="mc-angle-down-L_16"
        ></i>
        <i
            class="kbq-stepper-step-down"
            [small]="true"
            [tabindex]="-1"
            [autoColor]="true"
            (mousedown)="onStepDown($event)"
            kbq-icon-button="mc-angle-down-L_16"
        ></i>
    `,
    styleUrl: './stepper.scss',
    host: {
        class: 'kbq-stepper'
    },
    imports: [KbqIconModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqStepper {
    @Output() readonly stepUp: EventEmitter<void> = new EventEmitter<void>();
    @Output() readonly stepDown: EventEmitter<void> = new EventEmitter<void>();

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
