import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';
import { EmptyStateExamplesModule, EmptyStateSizeExample } from '../../docs-examples/components/empty-state';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [EmptyStateExamplesModule],
    template: `
        <empty-state-actions-example />
        <hr />
        <empty-state-actions2-example />
        <hr />
        <empty-state-align-example />
        <hr />
        <empty-state-big-example />
        <hr />
        <empty-state-content-example />
        <hr />
        <empty-state-default-example />
        <hr />
        <empty-state-error-example />
        <hr />
        <empty-state-icon-example />
        <hr />
        <empty-state-size-example />
        <hr />
        <empty-state-text-only-example />
        <hr />
        <empty-state-title-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column'
    }
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        FormsModule,
        KbqEmptyStateModule,
        KbqButtonModule,
        KbqIconModule,
        DevDocsExamples,
        DevThemeToggle,
        EmptyStateSizeExample
    ],
    templateUrl: 'template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;
}
