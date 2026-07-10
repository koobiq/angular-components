import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqLinkModule } from '@koobiq/components/link';
import { DocsAnchorsComponent } from '../anchors/anchors.component';
import { DocsOverviewComponentBase } from './component-viewer.component';

@Component({
    selector: 'docs-component-viewer-wrapper',
    imports: [
        DocsAnchorsComponent,
        KbqDividerModule,
        KbqLinkModule
    ],
    template: `
        <div class="docs-component-viewer__article">
            <ng-content select="[docs-article]" />

            <kbq-divider class="docs-article__divider" />

            <div class="kbq-callout kbq-callout_contrast">
                <div class="kbq-callout__header">
                    {{ t('improvementSuggestions') }}
                </div>

                <!-- prettier-ignore -->
                <div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">
                    @if (isRuLocale()) {
                        Если вы нашли ошибку или хотите доработать статью,
                        <a big href="https://github.com/koobiq/angular-components/issues/new/choose" kbq-link>создайте запрос на&nbsp;GitHub</a>.
                    } @else {
                        If you found a mistake or want to improve the article,
                        <a big href="https://github.com/koobiq/angular-components/issues/new/choose" kbq-link>create an issue on GitHub</a>.
                    }
                </div>
            </div>
        </div>

        <div class="docs-component-viewer__sticky-wrapper">
            <docs-anchors [headerSelectors]="'.docs-header-link'" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'docs-component-overview'
    }
})
export class DocsComponentViewerWrapperComponent extends DocsOverviewComponentBase {
    constructor() {
        super();
    }
}
