import { Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { TopMenuExamplesModule } from '../../docs-examples/components/top-menu';

@Component({
    standalone: true,
    selector: 'app',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './template.html',
    imports: [
        TopMenuExamplesModule,
        KbqButtonModule
    ]
})
export class TopMenuDev {
    navbarUnpinned = false;
}
