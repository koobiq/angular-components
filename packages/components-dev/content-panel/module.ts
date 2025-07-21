import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ContentPanelExamplesModule } from 'packages/docs-examples/components/content-panel';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [ContentPanelExamplesModule],
    selector: 'dev-examples',
    template: `
        <content-panel-overview-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    selector: 'dev-app',
    standalone: true,
    imports: [
        DevExamples,
        DevThemeToggle
    ],
    providers: [],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
