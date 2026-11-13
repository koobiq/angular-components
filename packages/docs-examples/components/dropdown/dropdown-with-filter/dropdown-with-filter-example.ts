import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    createSearchPredicate,
    KbqHighlightBackgroundPipe,
    KbqOptgroup,
    tokenizeSearchQuery
} from '@koobiq/components/core';
import { KbqDivider } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqCleaner, KbqFormField, KbqPrefix } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInput } from '@koobiq/components/input';

/**
 * @title Dropdown with filter
 */
@Component({
    selector: 'dropdown-with-filter-example',
    imports: [
        KbqDropdownModule,
        KbqButtonModule,
        KbqDivider,
        KbqOptgroup,
        KbqFormField,
        KbqPrefix,
        KbqIcon,
        KbqCleaner,
        KbqInput,
        ReactiveFormsModule,
        KbqHighlightBackgroundPipe
    ],
    template: `
        <button kbq-button type="button" [kbqDropdownTriggerFor]="dropdown" (dropdownClosed)="handleClosed()">
            Trigger
            <i kbq-icon="kbq-chevron-down-s_16"></i>
        </button>

        <kbq-dropdown #dropdown="kbqDropdown">
            <kbq-form-field kbqDropdownSearch>
                <i kbqPrefix kbq-icon="kbq-magnifying-glass_16"></i>
                <input autocomplete="off" kbqInput placeholder="Search" [formControl]="control" />
                <kbq-cleaner />
            </kbq-form-field>

            <kbq-divider />

            @let filtered = filteredGroups();

            @for (item of filtered.items; track item) {
                <button kbq-dropdown-item type="button">
                    <span [innerHTML]="item | kbqHighlightBackground: searchTokens"></span>
                </button>
            }

            @if (filtered.items.length > 0 && filtered.actions.length > 0) {
                <kbq-divider />
            }

            @if (filtered.actions.length > 0) {
                <kbq-optgroup label="Subheader for actions" />
            }

            @for (item of filtered.actions; track item) {
                <button kbq-dropdown-item type="button">
                    <span [innerHTML]="item | kbqHighlightBackground: searchTokens"></span>
                </button>
            }

            @if (filtered.items.length === 0 && filtered.actions.length === 0) {
                <button kbq-dropdown-item disabled type="button">Nothing found</button>
            }
        </kbq-dropdown>
    `,
    styles: `
        :host {
            height: 200px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownWithFilterExample {
    private readonly groups = {
        items: ['New tab', 'New window'],
        actions: ['Action one', 'Action two', 'Action three']
    };
    protected readonly control = new FormControl('');
    protected readonly filteredGroups = toSignal(
        this.control.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            map((value) => {
                const predicate = createSearchPredicate(value ?? '');

                return { items: this.groups.items.filter(predicate), actions: this.groups.actions.filter(predicate) };
            })
        ),
        { initialValue: this.groups }
    );

    protected get searchTokens(): string[] {
        return tokenizeSearchQuery(this.control.value ?? '');
    }

    protected handleClosed(): void {
        this.control.reset();
    }
}
