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
        <div class="layout-column layout-gap-xs layout-margin-bottom-l">
            Server response time
            <kbq-button-toggle-group [ngModel]="delay()" (ngModelChange)="delay.set($event)">
                @for (option of delayOptions; track option) {
                    <kbq-button-toggle [value]="option">{{ option }} ms</kbq-button-toggle>
                }
            </kbq-button-toggle-group>
        </div>

        <kbq-inline-edit showActions [saveHandler]="saveName" (saved)="name.set(nameControl.value)">
            <kbq-label>Progress on the save button</kbq-label>

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

        <kbq-inline-edit [saveHandler]="saveDescription" (saved)="description.set(descriptionControl.value)">
            <kbq-label>Progress on the field</kbq-label>

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
export class InlineEditSaveProgressExample {
    protected readonly placeholder = 'Placeholder';
    protected readonly delayOptions = [100, 250, 500, 3000];
    protected readonly delay = signal(500);

    protected readonly nameControl = new FormControl('Security team', { nonNullable: true });
    protected readonly name = signal(this.nameControl.value);

    protected readonly descriptionControl = new FormControl('Monitors incidents', { nonNullable: true });
    protected readonly description = signal(this.descriptionControl.value);

    protected readonly saveName: KbqInlineEditSaveHandler = () => this.sendToServer();
    protected readonly saveDescription: KbqInlineEditSaveHandler = () => this.sendToServer();

    // Emulates a request; in a real project return the HttpClient observable.
    private sendToServer(): Observable<unknown> {
        return timer(this.delay());
    }
}
