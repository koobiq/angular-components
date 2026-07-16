import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
import { E2eButtonStress } from 'packages/components/button/e2e';
import { ButtonExamplesModule } from 'packages/docs-examples/components/button';

@Component({
    selector: 'dev-examples',
    imports: [ButtonExamplesModule],
    template: `
        <button-overview-example />
        <hr />
        <button-group-overview-example />
        <hr />
        <button-group-style-example />
        <hr />
        <button-group-content-example />
        <hr />
        <button-group-custom-content-example />
        <hr />
        <button-group-vertical-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [KbqButtonModule, KbqIconModule, DevDocsExamples, KbqTitleModule, E2eButtonStress],
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {
    readonly colors = KbqComponentColors;
    readonly styles = KbqButtonStyles;
}
