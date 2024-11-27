import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTextareaModule } from '@koobiq/components/textarea';

/**
 * @title Textarea
 */
@Component({
    standalone: true,
    selector: 'text-area-overview-example',
    imports: [KbqFormFieldModule, KbqTextareaModule, FormsModule],
    template: `
        <kbq-form-field class="layout-margin-bottom-xl">
            <textarea [placeholder]="placeholder" kbqTextarea></textarea>
        </kbq-form-field>
        <kbq-form-field class="layout-margin-bottom-xl">
            <textarea [disabled]="disabled" [placeholder]="placeholder" kbqTextarea></textarea>
        </kbq-form-field>
        <kbq-form-field class="layout-margin-bottom-xl">
            <textarea [(ngModel)]="value" [placeholder]="placeholder" [required]="required" kbqTextarea></textarea>
        </kbq-form-field>
        <kbq-form-field kbqFormFieldWithoutBorders>
            <textarea [(ngModel)]="value" kbqTextarea placeholder="Placeholder"></textarea>
        </kbq-form-field>
    `
})
export class TextAreaOverviewExample {
    disabled: boolean = true;
    required: boolean = true;
    placeholder: string = 'placeholder';
    value: any;
}
