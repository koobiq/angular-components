import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSkeletonFormField } from '@koobiq/components/skeleton';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton form field preset
 */
@Component({
    selector: 'skeleton-form-field-example',
    imports: [
        KbqSkeletonFormField,
        KbqToggleModule,
        FormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqTextareaModule
    ],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        @if (loading()) {
            <kbq-skeleton-form-field horizontal hint labelClass="flex-30" contentClass="flex-70" />
            <kbq-skeleton-form-field hint />
            <kbq-skeleton-form-field control="textarea" hint />
        } @else {
            <kbq-form-field horizontal labelClass="flex-30" contentClass="flex-70">
                <kbq-label>Server address</kbq-label>
                <input kbqInput value="productname1.security.com" />
                <kbq-hint>Domain name or IP address</kbq-hint>
            </kbq-form-field>
            <kbq-form-field>
                <kbq-label>Port</kbq-label>
                <input kbqInput value="636" />
                <kbq-hint>LDAPS listens on port 636</kbq-hint>
            </kbq-form-field>
            <kbq-form-field>
                <kbq-label>Description</kbq-label>
                <textarea kbqTextarea>Primary directory server of the security.com domain</textarea>
                <kbq-hint>Shown in the list of servers</kbq-hint>
            </kbq-form-field>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonFormFieldExample {
    protected readonly loading = model(true);
}
