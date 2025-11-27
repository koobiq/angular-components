import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';

import { KbqTextareaModule } from '@koobiq/components/textarea';
import { TextAreaExamplesModule } from '../../docs-examples/components/textarea';

@Component({
    selector: 'dev-examples',
    imports: [TextAreaExamplesModule],
    template: `
        <text-area-overview-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    selector: 'dev-app',
    imports: [KbqTextareaModule, KbqFormFieldModule, FormsModule, DevExamples],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    value: string;
}
