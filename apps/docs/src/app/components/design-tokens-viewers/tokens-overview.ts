import { Component } from '@angular/core';
import { AnchorsModule } from '../anchors/anchors.module';
import { animations, BaseOverviewComponent } from '../component-viewer/component-viewer.component';
import { DocsLiveExampleModule } from '../docs-live-example/docs-live-example-module';

@Component({
    standalone: true,
    selector: 'docs-design-tokens-overview',
    templateUrl: '../component-viewer/component-overview.template.html',
    host: {
        class: 'component-overview',
        '[@fadeInOut]': 'animationState',
        '(@fadeInOut.done)': 'animationDone.next(true)'
    },
    animations,
    imports: [
        AnchorsModule,
        DocsLiveExampleModule
    ]
})
export class TokensOverview extends BaseOverviewComponent {
    get docItemUrl(): string | null {
        if (!this.componentDocItem) return null;

        const currentTokensSection = this.currentUrl.split('/').filter(Boolean).pop();

        return `docs-content/overviews/${currentTokensSection}.html`;
    }

    constructor() {
        super();
    }
}
