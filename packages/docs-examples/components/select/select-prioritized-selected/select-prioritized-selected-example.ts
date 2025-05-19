import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Selected prioritized selected
 */
@Component({
    standalone: true,
    selector: 'select-prioritized-selected-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field>
            <kbq-select [(value)]="selected" (openedChange)="openedChange($event)" placeholder="Placeholder" multiple>
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }

                <kbq-cleaner #kbqSelectCleaner />
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 320px;
        }
    `
})
export class SelectPrioritizedSelectedExample {
    options = Array.from({ length: 15 }).map((_, i) => `Option #${i}`);
    selected = [this.options.at(-1)!, this.options.at(-2)!];

    constructor() {
        this.groupSelectedOptions();
    }

    openedChange(isOpened: boolean): void {
        if (!isOpened) this.groupSelectedOptions();
    }

    private groupSelectedOptions(): void {
        const unselected = this.options.filter((option) => !this.selected.includes(option));

        this.options = this.selected.concat(unselected);
    }
}
