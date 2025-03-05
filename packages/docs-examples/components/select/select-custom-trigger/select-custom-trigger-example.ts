import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title select-custom-trigger
 */
@Component({
    standalone: true,
    selector: 'select-custom-trigger-example',
    imports: [KbqSelectModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-select #select="kbqSelect" [(value)]="selected">
            <ng-container kbq-select-trigger>custom trigger {{ select.triggerValue }}</ng-container>

            @for (option of options; track option) {
                <kbq-option [value]="option">{{ option }}</kbq-option>
            }
        </kbq-select>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: var(--kbq-size-l);
        }
    `
})
export class SelectCustomTriggerExample {
    readonly options = Array.from({ length: 5 }).map((_, i) => `Option #${i}`);
    readonly selected = this.options[0];
}
