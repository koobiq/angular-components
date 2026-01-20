import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Input with mask
 */
@Component({
    selector: 'input-with-mask-example',
    imports: [KbqFormFieldModule, KbqInputModule, KbqIconModule],
    template: `
        <kbq-form-field>
            <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
            <input kbqInput placeholder="Placeholder" />
            <kbq-cleaner />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputWithMaskExample {}
