import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqCleaner, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Inline edit placeholder
 */
@Component({
    standalone: true,
    imports: [
        FormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqSelectModule,
        KbqCleaner,
        ReactiveFormsModule,
        KbqIcon,
        KbqInputModule
    ],
    selector: 'inline-edit-placeholder-example',
    template: `
        <kbq-inline-edit>
            <ng-container *kbqInlineEditViewMode>
                <div class="layout-row">
                    @if (!!value) {
                        <span>{{ value }}</span>
                    } @else {
                        <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                    }
                </div>
            </ng-container>
            <ng-container *kbqInlineEditEditMode>
                <kbq-form-field>
                    <input kbqInput [placeholder]="placeholder" [(ngModel)]="value" />
                </kbq-form-field>
            </ng-container>
        </kbq-inline-edit>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditPlaceholderExample {
    placeholder = 'Placeholder';
    value = '';
}
