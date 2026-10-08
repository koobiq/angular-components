import { ChangeDetectionStrategy, Component, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KBQ_MODAL_DATA, KbqModalService } from '@koobiq/components/modal';
import {
    KBQ_SIDEPANEL_DATA,
    KbqSidepanelActions,
    KbqSidepanelBody,
    KbqSidepanelClose,
    KbqSidepanelFooter,
    KbqSidepanelHeader,
    KbqSidepanelRef,
    KbqSidepanelService
} from '@koobiq/components/sidepanel';

export interface Employee {
    name: string;
    email: string;
    role: string;
}

export interface EmployeeDetailsData {
    employee: Employee;
}

/** The content of the details sidepanel: edits the role and hands the edited employee back as the result. */
@Component({
    selector: 'check-employee-details',
    imports: [
        ReactiveFormsModule,
        KbqButtonModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqSidepanelHeader,
        KbqSidepanelBody,
        KbqSidepanelFooter,
        KbqSidepanelActions,
        KbqSidepanelClose
    ],
    template: `
        <kbq-sidepanel-header [closeable]="true">{{ data.employee.name }}</kbq-sidepanel-header>

        <kbq-sidepanel-body>
            <p data-testid="details-email">{{ data.employee.email }}</p>

            <form [formGroup]="form" (ngSubmit)="save()">
                <kbq-form-field>
                    <kbq-label>Role</kbq-label>
                    <input kbqInput cdkFocusInitial data-testid="details-role" formControlName="role" />
                </kbq-form-field>
            </form>
        </kbq-sidepanel-body>

        <kbq-sidepanel-footer>
            <kbq-sidepanel-actions>
                <button kbq-button data-testid="details-save" [color]="'contrast'" (click)="save()">Save</button>
                <button kbq-button kbq-sidepanel-close data-testid="details-cancel">Cancel</button>
            </kbq-sidepanel-actions>
        </kbq-sidepanel-footer>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeDetails {
    protected readonly data = inject<EmployeeDetailsData>(KBQ_SIDEPANEL_DATA);
    private readonly sidepanelRef = inject<KbqSidepanelRef<EmployeeDetails, Employee>>(KbqSidepanelRef);

    protected readonly form = new FormGroup({
        role: new FormControl(this.data.employee.role, { nonNullable: true, validators: Validators.required })
    });

    protected save(): void {
        if (this.form.invalid) return;

        this.sidepanelRef.close({ ...this.data.employee, role: this.form.controls.role.value });
    }
}

/** The content of the delete confirmation; `kbqOnOk` reads its form. */
@Component({
    selector: 'check-employee-delete',
    imports: [ReactiveFormsModule, KbqCheckboxModule],
    template: `
        <p data-testid="delete-question">Delete {{ employee.name }}?</p>
        <kbq-checkbox data-testid="delete-reports" [formControl]="deleteReports">Delete their reports too</kbq-checkbox>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeDeleteConfirmation {
    protected readonly employee = inject<Employee>(KBQ_MODAL_DATA);

    readonly deleteReports = new FormControl(false, { nonNullable: true });
}

/** The sidepanel scenario, rendered by the page and by its suite. */
@Component({
    selector: 'check-sidepanel',
    imports: [
        KbqButtonModule,
        KbqSidepanelHeader,
        KbqSidepanelBody,
        KbqSidepanelFooter,
        KbqSidepanelActions,
        KbqSidepanelClose
    ],
    template: `
        <button kbq-button data-testid="open-details" (click)="openDetails()">Edit {{ employee().name }}</button>
        <button kbq-button data-testid="open-help" (click)="openHelp()">Help</button>
        <button kbq-button data-testid="open-delete" (click)="confirmDelete()">Delete</button>

        <p data-testid="employee-role">{{ employee().role }}</p>
        @if (deleted()) {
            <p data-testid="employee-deleted">Deleted</p>
        }

        <ng-template #help let-topic>
            <kbq-sidepanel-header [closeable]="true">Help: {{ topic }}</kbq-sidepanel-header>
            <kbq-sidepanel-body data-testid="help-body">A role decides what an employee can see.</kbq-sidepanel-body>
            <kbq-sidepanel-footer>
                <kbq-sidepanel-actions>
                    <button kbq-button kbq-sidepanel-close="read" data-testid="help-read">Got it</button>
                </kbq-sidepanel-actions>
            </kbq-sidepanel-footer>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidepanelScenario {
    private readonly sidepanel = inject(KbqSidepanelService);
    private readonly modal = inject(KbqModalService);
    private readonly helpTemplate = viewChild.required<TemplateRef<unknown>>('help');

    readonly employee = signal<Employee>({ name: 'Ada Lovelace', email: 'ada@example.com', role: 'Analyst' });
    readonly deleted = signal(false);

    /** What the scenario heard from its overlays, in order. */
    readonly events = signal<string[]>([]);

    openDetails(): void {
        const ref = this.sidepanel.open<EmployeeDetails, EmployeeDetailsData>(EmployeeDetails, {
            data: { employee: this.employee() }
        });

        ref.afterOpened().subscribe(() => this.log('details opened'));
        ref.afterClosed().subscribe((employee: Employee | undefined) => {
            this.log(`details closed: ${employee?.role ?? 'nothing'}`);

            if (employee) this.employee.set(employee);
        });
    }

    openHelp(): void {
        const ref = this.sidepanel.open(this.helpTemplate(), { data: 'roles', hasBackdrop: false });

        ref.afterOpened().subscribe(() => this.log('help opened'));
        ref.afterClosed().subscribe((result: string | undefined) => this.log(`help closed: ${result ?? 'nothing'}`));
    }

    confirmDelete(): void {
        const ref = this.modal.create<EmployeeDeleteConfirmation>({
            kbqTitle: 'Delete employee',
            kbqComponent: EmployeeDeleteConfirmation,
            data: this.employee(),
            kbqOkText: 'Delete',
            kbqCancelText: 'Cancel',
            kbqOnOk: (confirmation) => {
                this.log(`delete confirmed, reports: ${confirmation.deleteReports.value}`);
                this.deleted.set(true);
            },
            kbqOnCancel: () => this.log('delete cancelled')
        });

        ref.afterOpen.subscribe(() => this.log('delete opened'));
        ref.afterClose.subscribe(() => this.log('delete closed'));
    }

    private log(event: string): void {
        this.events.update((events) => [...events, event]);
    }
}
