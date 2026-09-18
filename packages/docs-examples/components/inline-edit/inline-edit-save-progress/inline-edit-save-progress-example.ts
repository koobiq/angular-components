import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqInlineEditModule, KbqInlineEditSaveHandler } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import { Observable, timer } from 'rxjs';

/**
 * @title Inline edit save progress
 */
@Component({
    selector: 'inline-edit-save-progress-example',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        KbqButtonToggleModule,
        KbqInlineEditModule,
        KbqInputModule
    ],
    template: `
        <div class="example-delay layout-column layout-gap-xs layout-margin-bottom-l">
            Server response time
            <kbq-button-toggle-group [ngModel]="delay()" (ngModelChange)="delay.set($event)">
                @for (option of delayOptions; track option) {
                    <kbq-button-toggle [value]="option">{{ option }} ms</kbq-button-toggle>
                }
            </kbq-button-toggle-group>
        </div>

        <kbq-inline-edit showActions [saveHandler]="save">
            <kbq-label>Name</kbq-label>

            <!-- View mode renders the control itself: editing closes before the server answers. -->
            <div class="example-inline-text" kbqInlineEditViewMode>
                @if (nameControl.value) {
                    {{ nameControl.value }}
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput [placeholder]="placeholder" [formControl]="nameControl" />
            </kbq-form-field>
        </kbq-inline-edit>

        <kbq-inline-edit [saveHandler]="save">
            <kbq-label>Description</kbq-label>

            <div class="example-inline-text" kbqInlineEditViewMode>
                @if (descriptionControl.value) {
                    {{ descriptionControl.value }}
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
        /* Without this the group stretches to the column width and the four buttons huddle on the left. */
        .example-delay {
            align-self: flex-start;
        }

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
export class InlineEditSaveProgressExample {
    protected readonly placeholder = 'Placeholder';
    protected readonly delayOptions = [100, 250, 500, 3000];
    protected readonly delay = signal(500);

    protected readonly nameControl = new FormControl('Security team', { nonNullable: true });
    protected readonly descriptionControl = new FormControl('Monitors incidents', { nonNullable: true });

    protected readonly save: KbqInlineEditSaveHandler = () => this.sendToServer();

    // Emulates a request; in a real project return the HttpClient observable.
    private sendToServer(): Observable<unknown> {
        return timer(this.delay());
    }
}
