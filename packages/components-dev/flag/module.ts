import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FlagExamplesModule } from '../../docs-examples/components/flag';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [FlagExamplesModule],
    template: `
        <flag-aspect-ratio-example />
        <flag-square-example />
        <flag-overview-example />
        <flag-language-example />
        <flag-fallback-example />
        <flag-stylized-example />
        <flag-circle-example />
        <flag-sizes-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [DevDocsExamples, DevThemeToggle],
    template: `
        <dev-theme-toggle />
        <dev-examples />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
