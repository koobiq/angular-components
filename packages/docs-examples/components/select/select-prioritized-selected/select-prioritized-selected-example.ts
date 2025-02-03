import { ChangeDetectionStrategy, Component, inject, OnInit, Signal } from '@angular/core';
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
            <kbq-select [(value)]="selected" (openedChange)="openedChange($event)" multiple>
                @for (option of options; track option) {
                    <kbq-option [value]="option">
                        <span [innerHTML]="option"></span>
                    </kbq-option>
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

        kbq-form-field {
            width: 320px;
        }
    `
})
export class SelectPrioritizedSelectedExample implements OnInit {
    options = inject<Signal<string[]>>('LOCALIZED_SELECT_OPTIONS_EXAMPLE' as any);

    ngOnInit() {
        this.popSelectedOptionsUp();
    }

    openedChange(isOpen: boolean) {
        if (!isOpen) {
            this.popSelectedOptionsUp();
        }
    }

    popSelectedOptionsUp(): void {
        const unselected = this.defaultOptions
            .filter((option) => !this.selected.includes(option))
            .sort((a, b) => this.defaultOptions.indexOf(a) - this.defaultOptions.indexOf(b));

        this.options = this.selected.concat(unselected);
    }
}
