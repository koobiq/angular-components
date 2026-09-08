import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';

/**
 * @title Checkbox indeterminate
 */
@Component({
    selector: 'checkbox-indeterminate-example',
    imports: [KbqCheckboxModule],
    template: `
        <kbq-checkbox [checked]="allSelected()" [indeterminate]="someSelected()" (change)="toggleAll()">
            All event types
        </kbq-checkbox>

        @for (eventType of eventTypes; track eventType) {
            <kbq-checkbox
                class="example-checkbox-indeterminate__child"
                [checked]="selected().has(eventType)"
                (change)="toggle(eventType)"
            >
                {{ eventType }}
            </kbq-checkbox>
        }
    `,
    styles: `
        .example-checkbox-indeterminate__child {
            margin-left: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column'
    }
})
export class CheckboxIndeterminateExample {
    protected readonly eventTypes = ['Malware', 'Phishing', 'Ransomware'];
    protected readonly selected = model(new Set([this.eventTypes[0]]));

    protected readonly allSelected = computed(() => this.selected().size === this.eventTypes.length);
    protected readonly someSelected = computed(() => this.selected().size > 0 && !this.allSelected());

    protected toggleAll(): void {
        this.selected.set(this.allSelected() ? new Set() : new Set(this.eventTypes));
    }

    protected toggle(eventType: string): void {
        this.selected.update((selected) => {
            const next = new Set(selected);

            if (!next.delete(eventType)) {
                next.add(eventType);
            }

            return next;
        });
    }
}
