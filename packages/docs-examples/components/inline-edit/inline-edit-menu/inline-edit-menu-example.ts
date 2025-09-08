import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconButton } from '@koobiq/components/icon';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTextareaModule } from '@koobiq/components/textarea';

/**
 * @title Inline edit menu
 */
@Component({
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconButton,
        KbqDropdownModule,
        KbqTextareaModule
    ],
    selector: 'inline-edit-menu-example',
    template: `
        <div class="layout-flex layout-column layout-gap-s">
            @let viewValue = displayValue();

            <kbq-inline-edit showActions (saved)="update()">
                <kbq-dropdown #dropdown="kbqDropdown">
                    <button kbq-dropdown-item (click)="clipboard.copy(value)">Copy text</button>
                </kbq-dropdown>
                <i
                    kbqInlineEditMenu
                    kbq-icon-button="kbq-ellipsis-vertical_16"
                    [kbqDropdownTriggerFor]="dropdown"
                    [color]="'contrast-fade'"
                ></i>
                <div kbqInlineEditViewMode>
                    @if (viewValue) {
                        <span>{{ viewValue }}</span>
                    } @else {
                        <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                    }
                </div>
                <kbq-form-field kbqInlineEditEditMode>
                    <textarea kbqTextarea [placeholder]="placeholder" [(ngModel)]="value"></textarea>
                </kbq-form-field>
            </kbq-inline-edit>

            <kbq-inline-edit showActions (saved)="update()">
                <kbq-label>Label</kbq-label>
                <kbq-dropdown #dropdown="kbqDropdown">
                    <button kbq-dropdown-item (click)="clipboard.copy(value)">Copy text</button>
                </kbq-dropdown>
                <i
                    kbqInlineEditMenu
                    kbq-icon-button="kbq-ellipsis-vertical_16"
                    [kbqDropdownTriggerFor]="dropdown"
                    [color]="'contrast-fade'"
                ></i>
                <div kbqInlineEditViewMode>
                    @if (viewValue) {
                        <span>{{ viewValue }}</span>
                    } @else {
                        <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                    }
                </div>
                <kbq-form-field kbqInlineEditEditMode>
                    <textarea kbqTextarea [placeholder]="placeholder" [(ngModel)]="value"></textarea>
                </kbq-form-field>
            </kbq-inline-edit>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditMenuExample {
    protected readonly clipboard = inject(Clipboard);
    protected readonly placeholder = 'Placeholder';
    protected value =
        'Multi-factor authentication involves multiple identification forms before account access, reducing the risk of unauthorized access';
    protected readonly displayValue = signal(this.value);

    protected update(): void {
        this.displayValue.set(this.value);
    }
}
