import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';

/** @title Input with cleaner */
@Component({
    selector: 'input-with-cleaner-example',
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field style="width: 320px">
            <input kbqInput [formControl]="control" />
            <kbq-cleaner />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputWithCleanerExample {
    protected readonly control = new FormControl('Text');
}
