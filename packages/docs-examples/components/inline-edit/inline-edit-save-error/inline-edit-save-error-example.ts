import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqInlineEditModule, KbqInlineEditSaveHandler } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import { catchError, Observable, of, switchMap, throwError, timer } from 'rxjs';

const TAKEN_NAMES = ['Admins', 'Support'];

class ExampleSaveError extends Error {
    constructor(
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
    imports: [ReactiveFormsModule, KbqInlineEditModule, KbqInputModule],
    template: `
        <p class="layout-margin-top-none layout-margin-bottom-l">
            Save «{{ takenNames }}» as the name to get the value rejected. Saving the description fails on the first
            attempt and succeeds on retry.
        </p>

        <kbq-inline-edit
            showActions
            [saveHandler]="saveName"
            [validationTooltip]="nameError() ?? 'Enter a name'"
            [tooltipPlacement]="tooltipPlacement"
            (saved)="name.set(nameControl.value)"
        >
            <kbq-label>Name</kbq-label>

            <div class="example-inline-text" kbqInlineEditViewMode>
                @if (name()) {
                    {{ name() }}
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput [placeholder]="placeholder" [formControl]="nameControl" />
            </kbq-form-field>
        </kbq-inline-edit>

        <kbq-inline-edit
            showActions
            [saveHandler]="saveDescription"
            [validationTooltip]="descriptionError() ?? ''"
            [tooltipPlacement]="tooltipPlacement"
            (saved)="description.set(descriptionControl.value)"
        >
            <kbq-label>Description</kbq-label>

            <div class="example-inline-text" kbqInlineEditViewMode>
                @if (description()) {
                    {{ description() }}
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput [placeholder]="placeholder" [formControl]="descriptionControl" />
            </kbq-form-field>
        </kbq-inline-edit>
    `,
    styles: `
        .example-inline-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-flex layout-column'
    }
})
export class InlineEditSaveErrorExample {
    protected readonly placeholder = 'Placeholder';
    protected readonly tooltipPlacement = PopUpPlacements.BottomLeft;
    protected readonly takenNames = TAKEN_NAMES.join('», «');

    protected readonly nameControl = new FormControl('Security team', {
        nonNullable: true,
        validators: [Validators.required]
    });
    protected readonly name = signal(this.nameControl.value);

    protected readonly descriptionControl = new FormControl('Monitors incidents', { nonNullable: true });
    protected readonly description = signal(this.descriptionControl.value);

    /** Messages of the last failed saves, shown instead of the client-side validation message. */
    protected readonly nameError = signal<string | null>(null);
    protected readonly descriptionError = signal<string | null>(null);

    protected readonly saveName: KbqInlineEditSaveHandler = () =>
        this.handleServerError(this.saveNameOnServer(this.nameControl.value), this.nameControl, this.nameError);

    protected readonly saveDescription: KbqInlineEditSaveHandler = () =>
        this.handleServerError(this.saveDescriptionOnServer(), this.descriptionControl, this.descriptionError);

    private descriptionAttempts = 0;

    constructor() {
        this.nameControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.nameError.set(null));
        this.descriptionControl.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.descriptionError.set(null));
    }

    private handleServerError(
        request$: Observable<unknown>,
        control: FormControl<string>,
        errorMessage: WritableSignal<string | null>
    ): Observable<unknown> {
        return request$.pipe(
            catchError((error: ExampleSaveError) => {
                errorMessage.set(error.message);

                // The field is marked invalid only when the value is the problem, so it resets once the value is
                // edited. Other errors keep the field valid, letting the user retry the same value.
                if (error.invalidValue) {
                    control.setErrors({ server: true });
                    control.markAsTouched();
                }

                // Rethrow so the inline edit stays in edit mode.
                return throwError(() => error);
            })
        );
    }

    // The methods below emulate requests; in a real project return the HttpClient observable.
    private saveNameOnServer(value: string): Observable<unknown> {
        return timer(1000).pipe(
            switchMap(() =>
                TAKEN_NAMES.includes(value.trim())
                    ? throwError(() => new ExampleSaveError(`The name «${value}» is already taken`, true))
                    : of(value)
            )
        );
    }

    private saveDescriptionOnServer(): Observable<unknown> {
        const attempt = ++this.descriptionAttempts;

        return timer(1000).pipe(
            switchMap(() =>
                attempt % 2 === 1
                    ? throwError(() => new ExampleSaveError('Couldn’t save the changes. Try again', false))
                    : of(null)
            )
        );
    }
}
