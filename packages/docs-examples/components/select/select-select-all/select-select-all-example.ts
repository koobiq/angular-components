import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqOption, KbqSelectAllEvent } from '@koobiq/components/core';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select all
 */
@Component({
    selector: 'select-select-all-example',
    imports: [KbqSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-select
                multiple
                selectAll
                placeholder="Placeholder"
                [formControl]="control"
                (onSelectAll)="onSelectAll($event)"
            >
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

        @if (lastSelectAllEvent(); as event) {
            <p>onSelectAll: {{ event.options.length }} options, selected = {{ event.selected }}</p>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-l);
        }

        .kbq-form-field-type-select {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectSelectAllExample {
    readonly options = Array.from({ length: 6 }).map((_, i) => `Option #${i}`);
    readonly control = new FormControl();

    readonly lastSelectAllEvent = signal<KbqSelectAllEvent<KbqOption> | null>(null);

    onSelectAll(event: KbqSelectAllEvent<KbqOption>): void {
        this.lastSelectAllEvent.set(event);
    }
}
