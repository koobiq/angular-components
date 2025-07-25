import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { ScrollbarExamplesModule } from 'packages/docs-examples/components/scrollbar';
import { DevThemeToggle } from '../theme-toggle';
import { DevBreadcrumbsSsrTest } from './breadcrumbs-ssr-test/breadcrumbs-ssr-test';

@Component({
    standalone: true,
    imports: [ScrollbarExamplesModule, DevBreadcrumbsSsrTest],
    selector: 'dev-examples',
    template: `
        <dev-breadcrumbs-ssr-test />
        <hr />
        <scrollbar-with-options-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [DevExamples, DevThemeToggle],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    constructor() {
        const platformID = inject(PLATFORM_ID);

        console.info('[dev:ssr] isPlatformServer: ', isPlatformServer(platformID));
        console.info('[dev:ssr] isPlatformBrowser: ', isPlatformBrowser(platformID));
    }
}
