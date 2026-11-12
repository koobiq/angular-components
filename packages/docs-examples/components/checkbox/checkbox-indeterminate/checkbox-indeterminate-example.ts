import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Checkbox indeterminate
 */
@Component({
    selector: 'checkbox-indeterminate-example',
    imports: [KbqCheckboxModule],
    template: `
        <kbq-checkbox [checked]="allSelected()" [indeterminate]="someSelected()" (change)="toggleAll()">
            {{ text().allEventTypes }}
        </kbq-checkbox>

        @for (eventType of eventTypes(); track eventType) {
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
            margin-top: var(--kbq-size-l);
            margin-left: calc(var(--kbq-size-l) + var(--kbq-size-s));
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-align-start-start'
    }
})
export class CheckboxIndeterminateExample extends BaseLocalizedExample<ExampleText> {
    protected readonly eventTypes = computed(() => this.text().eventTypes);
    protected readonly selected = signal(new Set([this.eventTypes()[0]]));

    protected readonly allSelected = computed(() => this.selected().size === this.eventTypes().length);
    protected readonly someSelected = computed(() => this.selected().size > 0 && !this.allSelected());

    protected toggleAll(): void {
        this.selected.set(this.allSelected() ? new Set() : new Set(this.eventTypes()));
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

    constructor() {
        super(TEXT);
    }
}
