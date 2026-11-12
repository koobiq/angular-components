import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Inline edit without label
 */
@Component({
    selector: 'inline-edit-without-label-example',
    imports: [
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqInputModule
    ],
    template: `
        <kbq-inline-edit>
            <div class="example-inline-text" kbqInlineEditViewMode>
                @if (!!control.value) {
                    <span>{{ control.value }}</span>
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput [placeholder]="placeholder" [formControl]="control" />
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditWithoutLabelExample extends BaseLocalizedExample<ExampleText> {
    protected get placeholder(): string {
        return this.text().country;
    }
    protected readonly control = new FormControl('Spain');

    constructor() {
        super(TEXT);
    }
}
