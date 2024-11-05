import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ThemePalette } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';

/**
 * @title Progress bar
 */
@Component({
    standalone: true,
    selector: 'progress-bar-overview-example',
    styles: `
        :host {
            .example-progress-bar-group {
                display: flex;
                flex-direction: column;
            }

            .example-progress-bar {
                margin-bottom: 12px;
            }
        }
    `,
    imports: [
        KbqProgressBarModule,
        KbqFormFieldModule,
        KbqInputModule,
        FormsModule
    ],
    template: `
        <div class="example-progress-bar-group">
            <kbq-progress-bar
                class="example-progress-bar"
                [value]="percent"
            />
            <kbq-form-field>
                <input
                    [(ngModel)]="percent"
                    kbqInput
                    max="100"
                    min="0"
                    step="5"
                    type="number"
                />
                <kbq-stepper />
            </kbq-form-field>
        </div>
    `
})
export class ProgressBarOverviewExample {
    themePalette = ThemePalette;

    percent: number = 30;
}
