import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TopBarExamplesModule } from '../../docs-examples/components/top-bar';

@Component({
    standalone: true,
    selector: 'app',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './template.html',
    imports: [
        TopBarExamplesModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarDev {
    navbarUnpinned = false;
}
