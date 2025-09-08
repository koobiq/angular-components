import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
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
        KbqInputModule
    ],
    selector: 'inline-edit-placeholder-example',
    template: `
        <kbq-inline-edit (saved)="update()">
            <ng-container *kbqInlineEditViewMode>
                <div class="example-inline-text">
                    @if (!!value) {
                        <span class="t">{{ value }}</span>
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
    styles: `
        .example-inline-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditPlaceholderExample {
    protected readonly placeholder = 'Placeholder';
    protected value = '';
    protected readonly displayValue = signal(this.value);

    protected update(): void {
        this.displayValue.set(this.value);
    }
}
