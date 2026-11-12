import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSkeletonFormField } from '@koobiq/components/skeleton';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

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
        <kbq-toggle [(ngModel)]="loading">{{ text().loading }}</kbq-toggle>

        @if (loading()) {
            <kbq-skeleton-form-field horizontal hint labelClass="flex-30" contentClass="flex-70" />
            <kbq-skeleton-form-field hint />
            <kbq-skeleton-form-field control="textarea" hint />
        } @else {
            <kbq-form-field horizontal labelClass="flex-30" contentClass="flex-70">
                <kbq-label>{{ text().serverAddress }}</kbq-label>
                <input kbqInput value="productname1.security.com" />
                <kbq-hint>{{ text().domainHint }}</kbq-hint>
            </kbq-form-field>
            <kbq-form-field>
                <kbq-label>{{ text().port }}</kbq-label>
                <input kbqInput value="636" />
                <kbq-hint>{{ text().ldapsPortHint }}</kbq-hint>
            </kbq-form-field>
            <kbq-form-field>
                <kbq-label>{{ text().description }}</kbq-label>
                <textarea kbqTextarea>{{ text().directoryDescription }}</textarea>
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
export class SkeletonFormFieldExample extends BaseLocalizedExample<ExampleText> {
    protected readonly loading = model(true);

    constructor() {
        super(TEXT);
    }
}
