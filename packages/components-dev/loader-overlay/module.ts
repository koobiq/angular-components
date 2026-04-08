import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { ThemePalette } from '@koobiq/components/core';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import { LoaderOverlayExamplesModule } from '../../docs-examples/components/loader-overlay';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    selector: 'dev-examples',
    imports: [LoaderOverlayExamplesModule],
    template: `
        <loader-overlay-overview-example />
        <hr />
        <loader-overlay-fixed-top-example />
        <hr />
        <loader-overlay-default-example />
        <hr />
        <loader-overlay-large-example />
        <hr />
        <loader-overlay-size-example />
        <hr />
        <loader-overlay-on-background-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        KbqButtonModule,
        KbqProgressSpinnerModule,
        KbqLoaderOverlayModule,
        DevThemeToggle,
        DevDocsExamples
    ],
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    themePalette = ThemePalette;

    text = 'text text text text text text text text text text text text text text ';
    caption = 'caption caption caption caption caption caption caption caption ';

    loading = true;
}
