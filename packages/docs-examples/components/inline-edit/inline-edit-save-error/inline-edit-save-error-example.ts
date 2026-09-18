import { ChangeDetectionStrategy, Component, forwardRef, inject, TemplateRef, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    KBQ_INLINE_EDIT_SAVE_ERROR_HANDLER,
    KbqInlineEditModule,
    KbqInlineEditSaveErrorContext,
    KbqInlineEditSaveHandler
} from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqToastComponent, KbqToastModule, KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { Observable, of, switchMap, throwError, timer } from 'rxjs';

const TAKEN_NAMES = ['Admins', 'Support'];

class ExampleSaveError extends Error {
    constructor(
        /** Name of the field the message is about. */
        readonly field: string,
        message: string,
        /** Whether the server rejected the value itself, as opposed to failing for another reason. */
        readonly invalidValue: boolean
    ) {
        super(message);
    }
}

/**
 * @title Inline edit save error
 */
@Component({
    selector: 'inline-edit-save-error-example',
    imports: [
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqInputModule,
        KbqButtonModule,
        KbqIconModule,
        KbqLinkModule,
        KbqToastModule
    ],
    template: `
        <p class="example-intro layout-margin-top-none layout-margin-bottom-l">
            Save
            <span class="kbq-text-normal-strong">{{ takenNames }}</span>
            as the name to have the value rejected. Saving the description fails on the first attempt and succeeds on
            retry.
        </p>

        <kbq-inline-edit showActions [saveHandler]="saveName">
            <kbq-label>Name</kbq-label>

            <div class="example-inline-text" kbqInlineEditViewMode>{{ nameControl.value }}</div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput [formControl]="nameControl" />
            </kbq-form-field>
        </kbq-inline-edit>

        <kbq-inline-edit showActions [saveHandler]="saveDescription">
            <kbq-label>Description</kbq-label>

            <div class="example-inline-text" kbqInlineEditViewMode>{{ descriptionControl.value }}</div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput [formControl]="descriptionControl" />
            </kbq-form-field>
        </kbq-inline-edit>

        <ng-template #nameTitle>
            Couldn’t update the field
            <span class="kbq-text-normal-strong">Name</span>
        </ng-template>

        <ng-template #descriptionTitle>
            Couldn’t update the field
            <span class="kbq-text-normal-strong">Description</span>
        </ng-template>

        <!-- The failure is not about the value, so the same value is worth sending again. -->
        <ng-template #retryActions let-toast>
            <a
                kbq-link
                pseudo
                role="button"
                (click)="retry(toast)"
                (keydown.enter)="retry(toast)"
                (keydown.space)="$event.preventDefault(); retry(toast)"
            >
                Retry
            </a>
        </ng-template>

        <!-- The server rejected the value, so the user either fixes it or drops it. -->
        <ng-template #rejectedActions let-toast>
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

        .example-inline-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `,
    providers: [
        {
            provide: KBQ_INLINE_EDIT_SAVE_ERROR_HANDLER,
            // The inline edits resolve the token while this component is already constructed, so it can hand out
            // its own method as the application-wide reaction to a failed save.
            useFactory:
                (example: InlineEditSaveErrorExample) => (context: KbqInlineEditSaveErrorContext<ExampleSaveError>) =>
                    example.showSaveErrorToast(context),
            deps: [forwardRef(() => InlineEditSaveErrorExample)]
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-flex layout-column'
    }
})
export class InlineEditSaveErrorExample {
    protected readonly takenNames = TAKEN_NAMES.join(', ');

    protected readonly nameControl = new FormControl('Security team', {
        nonNullable: true,
        validators: [Validators.required]
    });
    protected readonly descriptionControl = new FormControl('Monitors incidents', { nonNullable: true });

    protected readonly saveName: KbqInlineEditSaveHandler = () => this.saveNameOnServer(this.nameControl.value);
    protected readonly saveDescription: KbqInlineEditSaveHandler = () => this.saveDescriptionOnServer();

    private readonly toastService = inject(KbqToastService);
    private readonly nameTitle = viewChild.required<TemplateRef<unknown>>('nameTitle');
    private readonly descriptionTitle = viewChild.required<TemplateRef<unknown>>('descriptionTitle');
    private readonly retryActions = viewChild.required<TemplateRef<unknown>>('retryActions');
    private readonly rejectedActions = viewChild.required<TemplateRef<unknown>>('rejectedActions');
    private readonly closeButton = viewChild.required<TemplateRef<unknown>>('closeButton');

    /** Inline edit behind every open notification, so its buttons act on the field the notification is about. */
    private readonly failedSaves = new Map<number, KbqInlineEditSaveErrorContext<ExampleSaveError>>();
    private descriptionAttempts = 0;

    /** Reports a failed save the way the application does it — here, with a toast the user has to answer. */
    showSaveErrorToast(context: KbqInlineEditSaveErrorContext<ExampleSaveError>): void {
        const { error } = context;

        const { id } = this.toastService.show(
            {
                style: KbqToastStyle.Error,
                title: error.field === 'Name' ? this.nameTitle() : this.descriptionTitle(),
                caption: error.message,
                actions: error.invalidValue ? this.rejectedActions() : this.retryActions(),
                closeButton: this.closeButton()
            },
            // The notification carries the only way back, so it never hides on its own.
            0
        );

        this.failedSaves.set(id, context);
    }

    protected retry(toast: KbqToastComponent): void {
        this.take(toast)?.inlineEdit.retrySave();
        toast.close();
    }

    protected edit(toast: KbqToastComponent): void {
        this.take(toast)?.inlineEdit.toggleMode();
        toast.close();
    }

    protected discard(toast: KbqToastComponent): void {
        this.take(toast)?.inlineEdit.rollback();
        toast.close();
    }

    private take(toast: KbqToastComponent): KbqInlineEditSaveErrorContext<ExampleSaveError> | undefined {
        const context = this.failedSaves.get(toast.id);

        this.failedSaves.delete(toast.id);

        return context;
    }

    // The methods below emulate requests; in a real project return the HttpClient observable.
    private saveNameOnServer(value: string): Observable<unknown> {
        return timer(1000).pipe(
            switchMap(() =>
                TAKEN_NAMES.includes(value.trim())
                    ? throwError(() => new ExampleSaveError('Name', `The name «${value}» is already taken`, true))
                    : of(value)
            )
        );
    }

    private saveDescriptionOnServer(): Observable<unknown> {
        const attempt = ++this.descriptionAttempts;

        return timer(1000).pipe(
            switchMap(() =>
                attempt % 2 === 1
                    ? throwError(
                          () => new ExampleSaveError('Description', 'The server is not responding. Try again', false)
                      )
                    : of(null)
            )
        );
    }
}
