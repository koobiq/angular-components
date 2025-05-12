import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { ThemePalette } from '@koobiq/components/core';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import { LoaderOverlayExamplesModule } from '../../docs-examples/components/loader-overlay';

@Component({
    standalone: true,
    imports: [KbqButtonModule, KbqProgressSpinnerModule, KbqLoaderOverlayModule, LoaderOverlayExamplesModule],
    selector: 'dev-app',
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
