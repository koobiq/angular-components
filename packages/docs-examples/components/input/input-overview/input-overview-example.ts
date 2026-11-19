import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqInputModule } from '@koobiq/components/input';

/** @title Input */
@Component({
    selector: 'input-overview-example',
    imports: [KbqInputModule],
    template: `
        <kbq-form-field style="width: 320px">
            <input kbqInput />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputOverviewExample {}
