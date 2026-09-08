import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqListModule } from '@koobiq/components/list';

/**
 * @title List select all
 */
@Component({
    selector: 'list-select-all-example',
    imports: [KbqListModule, FormsModule],
    template: `
        <kbq-list-selection aria-label="Mailboxes" multiple="checkbox" selectAll [(ngModel)]="selected">
            @for (option of options; track option) {
                <kbq-list-option [disabled]="option === 'Option 3'" [value]="option">{{ option }}</kbq-list-option>
            }
        </kbq-list-selection>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .kbq-list-selection {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListSelectAllExample {
    protected readonly options = Array.from({ length: 5 }).map((_, i) => `Option ${i + 1}`);

    protected selected = [this.options[1]];
}
