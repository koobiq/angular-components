import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { ButtonExamplesModule } from 'packages/docs-examples/components/button';

@Component({
    selector: 'dev-examples',
    imports: [ButtonExamplesModule],
    template: `
        <button-overview-example />
        <hr />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [KbqButtonModule, KbqIconModule, DevDocsExamples],
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    readonly colors = KbqComponentColors;
    readonly styles = KbqButtonStyles;
}
