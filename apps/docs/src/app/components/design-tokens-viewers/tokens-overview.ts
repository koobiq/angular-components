import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqLinkModule } from '@koobiq/components/link';
import { DocsAnchorsComponent } from '../anchors/anchors.component';
import { BaseOverviewComponent } from '../component-viewer/component-viewer.component';
import { DocsLiveExampleComponent } from '../live-example/docs-live-example';

@Component({
    standalone: true,
    imports: [
        DocsLiveExampleComponent,
        DocsAnchorsComponent,
        KbqDividerModule,
        KbqLinkModule
    ],
    selector: 'docs-design-tokens-overview',
    templateUrl: '../component-viewer/component-overview.template.html',
    host: {
        class: 'docs-component-overview'
    },
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
