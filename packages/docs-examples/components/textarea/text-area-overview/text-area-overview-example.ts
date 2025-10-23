import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTextareaModule } from '@koobiq/components/textarea';

/**
 * @title Textarea
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'text-area-overview-example',
    imports: [KbqFormFieldModule, KbqTextareaModule, FormsModule],
    template: `
        <kbq-form-field class="layout-margin-bottom-xl">
            <textarea kbqTextarea [placeholder]="placeholder" [canGrow]="false"></textarea>
        </kbq-form-field>
        <kbq-form-field class="layout-margin-bottom-xl">
            <textarea kbqTextarea [disabled]="disabled" [placeholder]="placeholder"></textarea>
        </kbq-form-field>
        <kbq-form-field class="layout-margin-bottom-xl">
            <textarea kbqTextarea [placeholder]="placeholder" [required]="required" [(ngModel)]="value"></textarea>
        </kbq-form-field>
        <kbq-form-field kbqFormFieldWithoutBorders>
            <textarea kbqTextarea placeholder="Placeholder" [(ngModel)]="value"></textarea>
        </kbq-form-field>
    `
})
export class TextAreaOverviewExample {
    disabled: boolean = true;
    required: boolean = true;
    placeholder: string = 'placeholder';
    value: any;
}
