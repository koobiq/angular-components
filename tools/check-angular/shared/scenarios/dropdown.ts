import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { DropdownCloseReason, KbqDropdownModule } from '@koobiq/components/dropdown';

/** The dropdown scenario, rendered by the page and by its suite. */
@Component({
    selector: 'check-dropdown',
    imports: [KbqButtonModule, KbqDropdownModule],
    template: `
        <label>
            File name
            <input #name class="check-dropdown__file-name" [value]="fileName()" (input)="fileName.set(name.value)" />
        </label>

        <button
            kbq-button
            class="check-dropdown__trigger"
            [kbqDropdownTriggerFor]="actions"
            [kbqDropdownTriggerData]="{ file: fileName() }"
            (dropdownOpened)="openedChanges.update((changes) => [...changes, true])"
            (dropdownClosed)="openedChanges.update((changes) => [...changes, false])"
        >
            Actions
        </button>

        <p class="check-dropdown__last-action">{{ lastAction() }}</p>

        <kbq-dropdown #actions="kbqDropdown" (closed)="closeReasons.update((reasons) => [...reasons, $event])">
            <ng-template let-file="file" kbqDropdownContent>
                <button kbq-dropdown-item (click)="run('Open ' + file)">Open {{ file }}</button>
                <button kbq-dropdown-item (click)="run('Rename')">Rename</button>
                <button kbq-dropdown-item disabled (click)="run('Delete')">Delete</button>
                <button kbq-dropdown-item [kbqDropdownTriggerFor]="exportFormats">Export</button>
            </ng-template>
        </kbq-dropdown>

        <kbq-dropdown #exportFormats="kbqDropdown">
            <button kbq-dropdown-item (click)="run('Export as PDF')">PDF</button>
            <button kbq-dropdown-item (click)="run('Export as CSV')">CSV</button>
        </kbq-dropdown>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownScenario {
    readonly fileName = signal('report.pdf');
    readonly lastAction = signal('');
    /** `true` per `dropdownOpened`, `false` per `dropdownClosed` of the root trigger. */
    readonly openedChanges = signal<boolean[]>([]);
    /** Every `closed` emission of the root panel, with its reason. */
    readonly closeReasons = signal<DropdownCloseReason[]>([]);

    protected run(action: string): void {
        this.lastAction.set(action);
    }
}
