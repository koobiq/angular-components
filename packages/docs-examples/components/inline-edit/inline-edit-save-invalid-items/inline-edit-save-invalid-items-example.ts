import { ChangeDetectionStrategy, Component, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KbqInlineEditModule,
    KbqInlineEditSaveErrorContext,
    KbqInlineEditSaveHandler
} from '@koobiq/components/inline-edit';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqToastComponent, KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { Observable, of, switchMap, throwError, timer } from 'rxjs';

const ROLES = ['user:read', 'user:create', 'user:update', 'user:delete', 'audit:read'];
/** Roles the fake server refuses to grant. */
const FORBIDDEN_ROLES = ['user:delete', 'user:update'];

class ExampleRolesError extends Error {
    constructor(readonly rejectedRoles: string[]) {
        super(`These roles are not available: ${rejectedRoles.join(', ')}`);
    }
}

/**
 * @title Inline edit save invalid items
 */
@Component({
    selector: 'inline-edit-save-invalid-items-example',
    imports: [
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqSelectModule,
        KbqBadgeModule,
        KbqButtonModule
    ],
    template: `
        <p class="layout-margin-top-none layout-margin-bottom-l">
            Add «{{ forbiddenRoles }}» to the roles to have the server reject them.
        </p>

        <kbq-inline-edit
            showActions
            [saveHandler]="save"
            (saved)="rejectedRoles.set([])"
            (saveError)="showToast($event)"
        >
            <kbq-label>Roles</kbq-label>

            <div class="layout-row layout-gap-xxs" style="flex-wrap: wrap;" kbqInlineEditViewMode>
                @for (role of control.value; track role) {
                    <!-- The server reports which values it refused, so only those badges turn into the error state. -->
                    <kbq-badge
                        [badgeColor]="rejectedRoles().includes(role) ? badgeColors.Error : badgeColors.FadeContrast"
                    >
                        {{ role }}
                    </kbq-badge>
                } @empty {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>

            <kbq-form-field kbqInlineEditEditMode>
                <kbq-select multiple [placeholder]="placeholder" [formControl]="control">
                    @for (role of roles; track role) {
                        <kbq-option [value]="role">{{ role }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </kbq-inline-edit>

        <ng-template #actions let-toast>
            <button kbq-button color="theme" [kbqStyle]="'transparent'" (click)="edit(toast)">Edit</button>
            <button kbq-button color="theme" [kbqStyle]="'transparent'" (click)="discard(toast)">
                Discard changes
            </button>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-flex layout-column'
    }
})
export class InlineEditSaveInvalidItemsExample {
    protected readonly placeholder = 'Placeholder';
    protected readonly roles = ROLES;
    protected readonly badgeColors = KbqBadgeColors;

    protected readonly forbiddenRoles = FORBIDDEN_ROLES.join('», «');

    protected readonly control = new FormControl<string[]>(['user:read', 'user:create'], { nonNullable: true });
    /** Values of the last failed save the server refused, matched against the badges in view mode. */
    protected readonly rejectedRoles = signal<string[]>([]);

    protected readonly save: KbqInlineEditSaveHandler = () => this.saveOnServer(this.control.value);

    private readonly toastService = inject(KbqToastService);
    private readonly actions = viewChild.required<TemplateRef<unknown>>('actions');
    private failedSave: KbqInlineEditSaveErrorContext<ExampleRolesError> | null = null;

    constructor() {
        // Editing the value drops the marks: they belong to the values that were sent.
        this.control.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.rejectedRoles.set([]));
    }

    protected showToast(context: KbqInlineEditSaveErrorContext<ExampleRolesError>): void {
        const { error } = context;

        this.rejectedRoles.set(error.rejectedRoles);
        this.failedSave = context;

        this.toastService.show(
            {
                style: KbqToastStyle.Error,
                title: 'Couldn’t update the field «Roles»',
                caption: error.message,
                actions: this.actions()
            },
            0
        );
    }

    protected edit(toast: KbqToastComponent): void {
        this.failedSave?.inlineEdit.toggleMode();
        toast.close();
    }

    protected discard(toast: KbqToastComponent): void {
        this.failedSave?.inlineEdit.rollback();
        toast.close();
    }

    // Emulates a request; in a real project return the HttpClient observable.
    private saveOnServer(value: string[]): Observable<unknown> {
        const rejected = value.filter((role) => FORBIDDEN_ROLES.includes(role));

        return timer(1000).pipe(
            switchMap(() => (rejected.length ? throwError(() => new ExampleRolesError(rejected)) : of(value)))
        );
    }
}
