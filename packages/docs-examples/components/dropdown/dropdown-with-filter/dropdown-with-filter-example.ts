import { ESCAPE } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqHighlightPipe, KbqOptgroup } from '@koobiq/components/core';
import { KbqDivider } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqCleaner, KbqFormField, KbqPrefix } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInput } from '@koobiq/components/input';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

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
        KbqHighlightPipe
    ],
    template: `
        <button
            kbq-button
            [kbqDropdownTriggerFor]="dropdown"
            (dropdownOpened)="handleOpened()"
            (dropdownClosed)="handleClosed()"
        >
            Open dropdown
            <i kbq-icon="kbq-chevron-down-s_16"></i>
        </button>

        <kbq-dropdown #dropdown="kbqDropdown">
            <kbq-form-field [noBorders]="true" (click)="$event.stopPropagation()">
                <i kbqPrefix kbq-icon="kbq-magnifying-glass_16"></i>
                <input kbqInput placeholder="Search" [formControl]="control" (keydown)="handleKeydown($event)" />
                <kbq-cleaner />
            </kbq-form-field>

            <kbq-divider />

            @let filtered = filteredGroups();

            @for (item of filtered[0]; track item) {
                <button kbq-dropdown-item>
                    <span [innerHTML]="item | mcHighlight: control.value"></span>
                </button>
            }

            @if (filtered[0].length > 0 && filtered[1].length > 0) {
                <kbq-divider />
            }

            @if (filtered[1].length > 0) {
                <kbq-optgroup label="Subheader for actions" />
            }

            @for (item of filtered[1]; track item) {
                <button kbq-dropdown-item>
                    <span [innerHTML]="item | mcHighlight: control.value"></span>
                </button>
            }

            @if (filtered[0].length === 0 && filtered[1].length === 0) {
                <button kbq-dropdown-item disabled>Nothing found</button>
            }
        </kbq-dropdown>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownWithFilterExample {
    private readonly formField = viewChild.required(KbqFormField);
    private readonly groups = [
        ['New tab', 'New window'],
        ['Action one', 'Action two', 'Action three']
    ];
    protected readonly control = new FormControl('');
    protected readonly filteredGroups = toSignal(
        this.control.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            map((value) => {
                const filterValue = value?.toLowerCase() || '';

                return this.groups.map((group) => group.filter((item) => item.toLowerCase().includes(filterValue)));
            })
        ),
        { initialValue: this.groups }
    );

    protected handleOpened(): void {
        this.formField().focus();
    }

    protected handleClosed(): void {
        this.control.reset();
    }

    protected handleKeydown(event: KeyboardEvent): void {
        event.stopPropagation();

        if (event.keyCode === ESCAPE) this.control.reset();
    }
}
