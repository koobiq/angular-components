import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AnchorsModule } from '../anchors/anchors.module';
import { BaseOverviewComponent, COMPONENT_VIEWER_ANIMATIONS } from '../component-viewer/component-viewer.component';
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
    animations: COMPONENT_VIEWER_ANIMATIONS,
    imports: [
        AnchorsModule,
        DocsLiveExampleModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensOverview extends BaseOverviewComponent {
    private readonly router = inject(Router);

    get docItemUrl(): string | null {
        if (!this.componentDocItem) return null;

        const currentTokensSection = this.router.parseUrl(this.router.url).root.children.primary.segments.pop()?.path;

        return `docs-content/overviews/${currentTokensSection}.html`;
    }
}
