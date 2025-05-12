import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqLocaleServiceModule } from '@koobiq/components/core';
import { TopBarExamplesModule } from '../../docs-examples/components/top-bar';
import { DevLocaleSelector } from '../locale-selector';

@Component({
    standalone: true,
    selector: 'dev-app',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './template.html',
    imports: [
        TopBarExamplesModule,
        DevLocaleSelector,
        KbqLocaleServiceModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    navbarUnpinned = false;
}
