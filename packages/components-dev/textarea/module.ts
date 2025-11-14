import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { TextAreaExamplesModule } from '../../docs-examples/components/textarea';

@Component({
    standalone: true,
    imports: [TextAreaExamplesModule],
    selector: 'dev-examples',
    template: `
        <text-area-overview-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [KbqTextareaModule, KbqFormFieldModule, FormsModule, DevExamples, KbqIcon],
    selector: 'dev-app',
    templateUrl: './template.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    value: string;
}
