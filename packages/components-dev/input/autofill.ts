import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormGroupDirective, FormsModule, NgForm } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { ErrorStateMatcher } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqTextareaModule } from '@koobiq/components/textarea';

/** Forces the error state on, so an autofilled field can be inspected while invalid. */
class AlwaysErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(_control: AbstractControl | null, _form: FormGroupDirective | NgForm | null): boolean {
        return true;
    }
}

/**
 * Harness for the browser's autofill styling (#DS-4096).
 *
 * Autofill cannot be triggered synthetically — neither Playwright nor jsdom can put an element into
 * `:autofill` — so this is the only way to see the real thing. It needs real `autocomplete` tokens on a
 * real `<form>` with a submit button: the browser only offers an entry back after the form has been
 * submitted once, and only over a secure context (`localhost` counts).
 *
 * What to check, per field: the container background matches the field's state and not the autofill
 * tint whenever the field is disabled, invalid, in an overlay or has no borders; the text and caret match
 * the state; the focus ring is fully visible with no notch; and nothing moves when the field is focused.
 */
@Component({
    selector: 'dev-autofill',
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqTextareaModule,
        KbqTagsModule,
        KbqButtonModule
    ],
    template: `
        <h3>Autofill (#DS-4096)</h3>
        <p>
            Fill the form and submit it once, then reload and pick the saved entry. Serve over
            <code>localhost</code>
            — the browser will not autofill an insecure origin.
        </p>

        <form class="dev-autofill" (ngSubmit)="submitted.set(true)">
            <div class="dev-autofill__row">
                <kbq-form-field>
                    <kbq-label>Username — default</kbq-label>
                    <input kbqInput name="username" autocomplete="username" [(ngModel)]="username" />
                </kbq-form-field>

                <kbq-form-field>
                    <kbq-label>Password — default</kbq-label>
                    <input kbqInputPassword name="password" autocomplete="current-password" [(ngModel)]="password" />
                    <kbq-password-toggle />
                </kbq-form-field>
            </div>

            <div class="dev-autofill__row">
                <kbq-form-field>
                    <kbq-label>Email — invalid (error must beat the autofill tint)</kbq-label>
                    <input
                        kbqInput
                        type="email"
                        name="email"
                        autocomplete="email"
                        [errorStateMatcher]="alwaysError"
                        [(ngModel)]="email"
                    />
                </kbq-form-field>

                <kbq-form-field>
                    <kbq-label>Phone — disabled after fill (disabled must beat the tint)</kbq-label>
                    <input kbqInput name="tel" autocomplete="tel" [disabled]="disabled()" [(ngModel)]="tel" />
                </kbq-form-field>
            </div>

            <div class="dev-autofill__row">
                <kbq-form-field noBorders>
                    <kbq-label>Organization — noBorders</kbq-label>
                    <input kbqInput name="org" autocomplete="organization" [(ngModel)]="organization" />
                </kbq-form-field>

                <kbq-form-field [inOverlay]="true">
                    <kbq-label>Country — inOverlay (must stay on the card background)</kbq-label>
                    <input kbqInput name="country" autocomplete="country-name" [(ngModel)]="country" />
                </kbq-form-field>
            </div>

            <div class="dev-autofill__row">
                <kbq-form-field>
                    <kbq-label>Address — textarea</kbq-label>
                    <textarea kbqTextarea name="address" autocomplete="street-address" [(ngModel)]="address"></textarea>
                </kbq-form-field>

                <kbq-form-field>
                    <kbq-label>City — tag input (no autocomplete="off" here, unlike the e2e host)</kbq-label>
                    <kbq-tag-list #tagList>
                        <input kbqInput name="city" autocomplete="address-level2" [kbqTagInputFor]="tagList" />
                    </kbq-tag-list>
                </kbq-form-field>
            </div>

            <div class="dev-autofill__row">
                <button kbq-button type="submit">Submit (teaches the browser the entry)</button>
                <button kbq-button type="button" (click)="disabled.set(!disabled())">
                    Toggle disabled — the only way to reach autofilled + disabled
                </button>
                <button kbq-button type="button" (click)="lateFormShown.set(!lateFormShown())">
                    Toggle the late field
                </button>
            </div>
        </form>

        <!--
            Created after autofill has already run, so the browser applies its background at the field's
            very first style computation. The old implementation masked that background with a
            5000-second background-color transition, which needs a value change to start and therefore
            did nothing here — this is the reproducer for that failure.
        -->
        @if (lateFormShown()) {
            <form class="dev-autofill">
                <kbq-form-field>
                    <kbq-label>Late field — first-paint autofill</kbq-label>
                    <input kbqInput name="username" autocomplete="username" [(ngModel)]="lateUsername" />
                </kbq-form-field>
            </form>
        }

        @if (submitted()) {
            <p>Submitted — reload the page and the browser should offer the entry back.</p>
        }
    `,
    styles: `
        .dev-autofill {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
            margin-bottom: var(--kbq-size-xxl);
        }

        .dev-autofill__row {
            display: flex;
            gap: var(--kbq-size-l);
            align-items: flex-start;
        }

        .dev-autofill__row > * {
            flex: 1;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevAutofill {
    protected readonly alwaysError = new AlwaysErrorStateMatcher();

    protected readonly disabled = signal(false);
    protected readonly submitted = signal(false);
    protected readonly lateFormShown = signal(false);

    protected username = '';
    protected password = '';
    protected email = '';
    protected tel = '';
    protected organization = '';
    protected country = '';
    protected address = '';
    protected lateUsername = '';
}
