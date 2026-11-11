import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectExampleText } from '../l10n';

/**
 * @title Selected prioritized selected
 */
@Component({
    selector: 'select-prioritized-selected-example',
    imports: [KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select
                multiple
                [placeholder]="text().placeholder"
                [(value)]="selected"
                (openedChange)="openedChange($event)"
            >
                @for (option of options(); track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }

                <kbq-cleaner />
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectPrioritizedSelectedExample {
    protected readonly text = injectExampleText();

    readonly options = signal<string[]>([]);
    selected: string[] = [];

    constructor() {
        effect(() => {
            const all = Array.from({ length: 15 }, (_, i) => this.text().optionN(i));

            if (!this.selected.length) {
                this.selected = [all.at(-1)!, all.at(-2)!];
            }

            this.options.set(this.selected.concat(all.filter((option) => !this.selected.includes(option))));
        });
    }

    openedChange(isOpened: boolean): void {
        if (!isOpened) this.groupSelectedOptions();
    }

    private groupSelectedOptions(): void {
        const unselected = this.options().filter((option) => !this.selected.includes(option));

        this.options.set(this.selected.concat(unselected));
    }
}
