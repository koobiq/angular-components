import { Component } from '@angular/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqLinkModule } from '@koobiq/components/link';
import { DocsAnchorsComponent } from '../anchors/anchors.component';
import { DocsOverviewComponentBase } from './component-viewer.component';

@Component({
    standalone: true,
    selector: 'docs-component-viewer-wrapper',
    template: `
        <div class="docs-component-viewer__article">
            <ng-content select="[docs-article]" />

            <kbq-divider class="docs-article__divider" />

            <div class="kbq-callout kbq-callout_contrast">
                <div class="kbq-callout__header">
                    {{ isRuLocale() ? 'Вопросы и предложения по документации' : 'Docs Feedback' }}
                </div>

                <div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">
                    @if (isRuLocale()) {
                        Если у вас есть вопросы или вы хотите внести свой вклад в написание документации, пожалуйста,
                        <a big href="https://github.com/koobiq/angular-components/issues/new/choose" kbq-link>
                            создайте issue
                        </a>
                        в нашем репозитории на GitHub.
                    } @else {
                        If you have any questions or would like to contribute to writing the documentation, please
                        <a big href="https://github.com/koobiq/angular-components/issues/new/choose" kbq-link>
                            create an issue
                        </a>
                        in our GitHub repository.
                    }
                </div>
            </div>
        </div>

        <div class="docs-component-viewer__sticky-wrapper">
            <docs-anchors [headerSelectors]="'.docs-header-link'" />
        </div>
    `,
    host: {
        class: 'docs-component-overview'
    },
    imports: [
        DocsAnchorsComponent,
        KbqDividerModule,
        KbqLinkModule
    ]
})
export class DocsComponentViewerWrapperComponent extends DocsOverviewComponentBase {
    constructor() {
        super();
    }
}
