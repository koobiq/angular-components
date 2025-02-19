import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TopMenuExamplesModule } from '../../docs-examples/components/top-menu';

@Component({
    standalone: true,
    selector: 'app',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './template.html',
    imports: [
        TopMenuExamplesModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopMenuDev {
    navbarUnpinned = false;
}
