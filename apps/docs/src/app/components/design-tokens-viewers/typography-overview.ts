import {
    afterNextRender,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    inject,
    Injector,
    signal,
    viewChild
} from '@angular/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DocsLocaleState } from '../../services/locale';
import { DocsCodeSnippetDirective } from '../code-snippet/code-snippet';
import { DocsComponentViewerWrapperComponent } from '../component-viewer/component-viewer-wrapper';

import { TitleCasePipe } from '@angular/common';
import { KbqTableModule } from '@koobiq/components/table';
import { docsData } from './data/typography';

@Component({
    selector: 'docs-typography-table',
    imports: [
        DocsComponentViewerWrapperComponent,
        KbqToolTipModule,
        DocsCodeSnippetDirective,
        KbqTableModule,
        TitleCasePipe
    ],
    template: `
        <docs-component-viewer-wrapper>
            <table kbq-table class="docs-font-classes-table" docs-article [border]="true">
                <thead>
                    <tr class="kbq-caps-compact">
                        <th>{{ t('typographyExample') }}</th>
                        <th>{{ t('cssClassName') }}</th>
                    </tr>
                </thead>
                <tbody>
                    @for (token of tokensInfo(); track token) {
                        <tr>
                            <td>
                                <div [class]="getClassName(token)">{{ token | titlecase }}</div>
                            </td>
                            <td>
                                <span
                                    docsCodeSnippet
                                    class="kbq-markdown__code"
                                    [kbqTooltip]="t('copy')"
                                    [kbqTooltipArrow]="false"
                                >
                                    kbq-{{ token }}
                                </span>
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
        </docs-component-viewer-wrapper>
    `,
    styleUrls: ['design-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-markdown'
    }
})
export class DocsTypographyTable extends DocsLocaleState implements AfterViewInit {
    protected readonly wrapper = viewChild.required(DocsComponentViewerWrapperComponent);

    protected readonly tokensInfo = signal(docsData);

    private readonly injector = inject(Injector);

    ngAfterViewInit() {
        // Defer to the next render so the wrapper view exists and its content has laid out. Also
        // triggers the ancestor `docs-component-viewer`'s `KbqScrollbar.update()` (via
        // `DocsOverviewComponentBase.showView()`) — without it, switching to this tab wouldn't
        // re-measure and could leave a stale overflow state from whichever tab was open before.
        afterNextRender(() => this.wrapper().scrollToSelectedContentSection(), { injector: this.injector });
    }

    getClassName(text: string): string {
        return `kbq-${text}`;
    }
}
