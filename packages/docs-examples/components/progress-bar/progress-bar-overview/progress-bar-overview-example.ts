import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';

/**
 * @title Progress bar
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'progress-bar-overview-example',
    styles: `
        .example-progress-bar {
            margin-bottom: var(--kbq-size-m);
        }
    `,
    imports: [
        KbqProgressBarModule,
        KbqFormFieldModule,
        KbqInputModule,
        FormsModule
    ],
    template: `
        <kbq-progress-bar class="example-progress-bar" [value]="percent()" />
        <kbq-form-field>
            <input kbqInput kbqNumberInput [min]="0" [max]="100" [step]="5" [(ngModel)]="percent" />
            <kbq-stepper />
        </kbq-form-field>
    `
})
export class ProgressBarOverviewExample {
    readonly percent = model(30);
}
