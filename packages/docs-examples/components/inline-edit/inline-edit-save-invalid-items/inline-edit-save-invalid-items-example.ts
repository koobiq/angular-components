import { ChangeDetectionStrategy, Component, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    KbqInlineEditModule,
    KbqInlineEditSaveErrorContext,
    KbqInlineEditSaveHandler
} from '@koobiq/components/inline-edit';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTagsModule } from '@koobiq/components/tags';
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
        KbqButtonModule,
        KbqIconModule,
        KbqLinkModule,
        KbqTagsModule
    ],
    template: `
        <p class="example-intro layout-margin-top-none layout-margin-bottom-l">
            Add
            <span class="kbq-text-normal-strong">{{ forbiddenRoles }}</span>
            to the roles to have the server reject them.
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

                    <!-- The tags carry the same marks as the badges, so the refused role is visible while editing. -->
                    <ng-template #kbqSelectTagContent let-option let-select="select">
                        <kbq-tag
                            [selectable]="false"
                            [disabled]="option.disabled || select.disabled"
                            [color]="rejectedRoles().includes(option.value) ? tagColors.Error : tagColors.ContrastFade"
                        >
                            {{ option.viewValue }}
                            <!-- The custom template replaces the built-in markup, so the remove control is up to us. -->
                            @if (!option.disabled && !select.disabled) {
                                <i
                                    kbq-icon="kbq-xmark-s_16"
                                    kbqTagRemove
                                    (click)="select.onRemoveMatcherItem(option, $event)"
                                ></i>
                            }
                        </kbq-tag>
                    </ng-template>
                </kbq-select>
            </kbq-form-field>
        </kbq-inline-edit>

        <ng-template #title>
            Couldn’t update the field
            <span class="kbq-text-normal-strong">Roles</span>
        </ng-template>

        <ng-template #actions let-toast>
            <a
                kbq-link
                pseudo
                role="button"
                class="layout-margin-right-m"
                (click)="edit(toast)"
                (keydown.enter)="edit(toast)"
                (keydown.space)="$event.preventDefault(); edit(toast)"
            >
                Edit
            </a>
            <a
                kbq-link
                pseudo
                role="button"
                (click)="discard(toast)"
                (keydown.enter)="discard(toast)"
                (keydown.space)="$event.preventDefault(); discard(toast)"
            >
                Discard changes
            </a>
        </ng-template>

        <!-- Closing the notification without reacting discards the unsaved value as well. -->
        <ng-template #closeButton let-toast>
            <button kbq-toast-close-button kbq-icon-button="kbq-xmark_16" (click)="discard(toast)"></button>
        </ng-template>
    `,
    styles: `
        /* Lines the text up with the inline edit content, which its own horizontal padding indents. */
        .example-intro {
            padding-inline: var(--kbq-size-s);
        }
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
    protected readonly tagColors = KbqComponentColors;

    protected readonly forbiddenRoles = FORBIDDEN_ROLES.join(', ');

    protected readonly control = new FormControl<string[]>(['user:read', 'user:create'], { nonNullable: true });
    /** Values of the last failed save the server refused, matched against the badges in view mode. */
    protected readonly rejectedRoles = signal<string[]>([]);

    protected readonly save: KbqInlineEditSaveHandler = () => this.saveOnServer(this.control.value);

    private readonly toastService = inject(KbqToastService);
    private readonly title = viewChild.required<TemplateRef<unknown>>('title');
    private readonly actions = viewChild.required<TemplateRef<unknown>>('actions');
    private readonly closeButton = viewChild.required<TemplateRef<unknown>>('closeButton');
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
                title: this.title(),
                caption: error.message,
                actions: this.actions(),
                closeButton: this.closeButton()
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
