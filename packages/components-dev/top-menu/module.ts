import { Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { TopMenuExamplesModule } from '../../docs-examples/components/top-menu';

@Component({
    standalone: true,
    selector: 'app-article',
    template: `
        <div style="height: 600px;">ArticleDemoComponent</div>
    `,
    encapsulation: ViewEncapsulation.None
})
export class ArticleDemoComponent {}

@Component({
    standalone: true,
    selector: 'app',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './template.html',
    imports: [
        TopMenuExamplesModule,
        KbqButtonModule,
        ArticleDemoComponent
    ]
})
export class TopMenuDev {
    navbarUnpinned = false;
}
