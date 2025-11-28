import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Inline edit without label
 */
@Component({
    selector: 'inline-edit-without-label-example',
    imports: [
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
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
export class InlineEditWithoutLabelExample {
    protected readonly placeholder = 'Country';
    protected readonly control = new FormControl('Spain');
}
