import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { ButtonExamplesModule } from 'packages/docs-examples/components/button';

@Component({
    standalone: true,
    imports: [ButtonExamplesModule],
    selector: 'dev-examples',
    template: `
        <button-state-and-style-example />
        <hr />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [KbqButtonModule, KbqIconModule, DevExamples],
    selector: 'dev-app',
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    readonly colors = KbqComponentColors;
    readonly styles = KbqButtonStyles;
}
