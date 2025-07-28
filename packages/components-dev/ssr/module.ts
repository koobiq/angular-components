import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { ScrollbarExamplesModule } from 'packages/docs-examples/components/scrollbar';
import { DevThemeToggle } from '../theme-toggle';
import { DevBreadcrumbsHydration } from './components/breadcrumbs';

@Component({
    standalone: true,
    imports: [ScrollbarExamplesModule, DevBreadcrumbsHydration],
    selector: 'dev-examples',
    template: `
        <dev-breadcrumbs-hydration />
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
