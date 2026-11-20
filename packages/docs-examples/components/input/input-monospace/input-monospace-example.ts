import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';

/** @title Monospace input */
@Component({
    selector: 'input-monospace-example',
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field style="width: 420px">
            <input kbqInput kbqInputMonospace [formControl]="control" />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class InputMonospaceExample {
    protected readonly control = new FormControl('9f3a7c1e2b4d6f8a0c9e5b7d3f1a6c2e8b4d0f9a');
}
